import { EmojisService } from './../../services/emojis.service';
import { UploadService } from '../../services/upload.service';
import { Socket } from 'ngx-socket-io';
import { NotificationService } from '../../services/notification.service';
import { ChatMessagesModel } from 'src/app/models/chat-messages.model';
import { Notification, User } from '../../models/user.model';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { ChatModel } from '../../models/chat.model';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ENV } from '../../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private socket: Socket,
    private uploadService: UploadService,
    private emojisService: EmojisService
  ) { }

  chat: ChatModel;
  chats: ChatModel[] = [];
  user: User;
  sideBarReady = false;
  chatReady = false;
  messageToSend: string = '';
  messageToSendValid = false;
  inputHasFocus = false;
  apiUrl: string = ENV.API_URL;
  emojis: any;
  showEmojis: boolean = false;

  filesAttached: File[] = [];
  @ViewChild('attachFile') attachFile: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.emojis = this.emojisService.returnEmojis();

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (!target.classList.contains('emojis') && !target.classList.contains('fa-smile-beam') && target.tagName !== 'SPAN') {
        this.showEmojis = false;
      }
    });

    this.route.params.subscribe(
      params =>  {
        if (params['chatId']) {
          this.getChatById(params['chatId']);
        }
        else {
          this.getChatsByParticipant();
        }
        
      }
    );


    this.chatService.getMessages().subscribe(
      success => {
        this.chat.messages.push(success);
      },
      error => console.error(error)
    );

    

  }
  getChatById(id: number) {
    this.chatService.getById(id).subscribe(
      success => {
        this.chat = success;
        
        this.chat.participant1 = new User(success.participant1);
        this.chat.participant2 = new User(success.participant2);     
        this.chatReady = true;
        
        setTimeout(() => {
          const elementMessages = document.getElementsByClassName('messages')[0];
          elementMessages.scrollTop = elementMessages.scrollHeight;
        }, 100);

        this.joinToChat();
        this.updateReadMessages();
        this.getChatsByParticipant();
        
      },
      error => console.error(`Error at get chat ${id}`, error)
    );
   
  }

  joinToChat() {
    this.socket.emit('join', { chat: this.chat.id }, (error) => {
      if (error) {
        console.error(error)
      }
    });
  }

  updateReadMessages() {
    for (const [index, item] of this.chat.messages.entries()) {
      if (item.read_at === null || item.read_at === undefined ) {
        const sender = typeof item.sender === 'number' ? item.sender : item.sender.id;
        if(sender !== this.user.id) {
          this.chatService.updateStatusRead(item.id).subscribe(
            success => console.log('Status de leitura atualizado'),
            error => console.error(`Erro ao atualizar read_at da mensagem ${item.id}`, error)
          );
        }
        
      }
    }
  }

  getChatsByParticipant() {
    this.chatService.getChatsByParticipant1(this.user.id).subscribe(
      success => {
        this.chats = success;
        this.chatService.getChatsByParticipant2(this.user.id).subscribe(
          success => {
            for (const [index, item] of success.entries()) {
              this.chats.push(item);
            };
            this.participantsPhotos();
            
          },
          error => console.error(error)
        );
      },
      error => console.error(error)
    );
  }

  participantsPhotos() {

    for (const [index, item] of this.chats.entries()) {
      this.chats[index].participant1 = new User(item.participant1);
      this.chats[index].participant2 = new User(item.participant2);
    }

    this.sideBarReady = true;
  }

  loadChat(event) {
    const id = event.target.id;

    this.getChatById(id);
  }

  sortMessages(a: ChatMessagesModel, b:ChatMessagesModel): number {
    if (a.id < b.id) {
      return a.id;
    }
    else {
      return b.id
    }
  }

  addEmoji(event) {
    const emoji = event.target.innerHTML;

    this.messageToSend = this.messageToSend + emoji;
  }

  sendMessage() {

    if (this.filesAttached.length === 0 && (!this.messageToSend || this.messageToSend === '')) {
      this.messageToSendValid = false;
      this.inputHasFocus = true;
      return;
    }

    const message = { 
      message: this.messageToSend, 
      sender: this.user, 
      receiver: this.user.id === this.chat.participant1.id ? this.chat.participant2 : this.chat.participant1,
      attachments: [], 
      read_at: null, 
      chat: this.chat ,
      archived: false,
      favorite: false
    };


    this.socket.emit(
      'sendMessage', 
      message, 
      (error) => {
        if (error) {
          console.error(error)
        }
      }
    );

    this.chatService.sendMessage(message).subscribe(
      success => {
        if (this.filesAttached.length > 0) {
          this.uploadFiles(success);
        }
      },
      error => console.error(error)
    )

    this.messageToSend = '';
    setTimeout(() => {
      const elementMessages = document.getElementsByClassName('messages')[0];
      elementMessages.scrollTop = elementMessages.scrollHeight;
    }, 100);

  }

  getUrlPhoto(url: string) {
    return `${this.apiUrl}${url}`
  }

  async openAttachFile() {
    const element: HTMLElement = this.attachFile.nativeElement;
    element.click();
  }

  addFiles(files: FileList) {
    this.filesAttached = this.filesAttached.concat(Array.prototype.slice.call(files));
  }

  removeFile(index: number) {
    this.filesAttached.splice(index, 1);
  }

  uploadFiles(chatMessage: ChatMessagesModel) {
    const form = new FormData();

    this.filesAttached.forEach(file => {
      form.append('files', file);
    });
    form.append('ref', 'chat-messages');
    form.append('filed', 'attachments');
    form.append('refId', `${chatMessage.id}`);

    this.uploadService.upload(form).subscribe(result => {
      chatMessage.attachments = result.map(r => r.id);

      this.chatService.updateMessage(chatMessage).subscribe(
        success => {
          console.log(success);
        },
        error => {
          console.error(['Erro ao atualizar mensagem com o upload', error])   
        }
      )
    })
  }

  notify() {
    const notify = new Notification({
      user: this.user.id === this.chat.participant1.id ? this.chat.participant2 : this.chat.participant1,
      job: this.chat.job,
      text: `O usuário ${this.user.name} lhe enviou uma mensagem.`,
      read: false,
      link: `chats/${this.chat.id}`
    });
    this.notificationService.notify(notify).subscribe(
      (result) => {
        console.log('[Envio de Pergunta] Notificação enviada')
      },
      (error) => {
        console.error('[Envio de Pergunta] Erro ao enviar notificação');
      }
    )
  }

  setFavorite(message: ChatMessagesModel) {
    message.favorite = !message.favorite;

    this.chatService.updateMessage(message).subscribe(
      success => {},
      error => {}
    )
  }

}
