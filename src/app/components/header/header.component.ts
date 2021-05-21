import { ChatMessagesModel } from 'src/app/models/chat-messages.model';
import { ChatService } from '../../services/chat.service';
import { UploadService } from '../../services/upload.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Notification, User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() showSearch: boolean = false;
  @Input() menu: string;

  showMessages: boolean = false;
  showNotifications: boolean = false;

  user: User;
  notifications: Notification[] = [];
  messagesNotRead: ChatMessagesModel[] = [];

  searchText: string = '';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private uploadService: UploadService,
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    let id;
    this.notificationService.getNotifications().subscribe(
      success => {
        console.log('Nova notificação: ');
        console.log(success);
      },
      error => {
        console.error(error);
      }
    )

    if(this.authService.isLogged()){
      this.menu = 'logged';
      this.user = new User(JSON.parse(localStorage.getItem('user')));
      
      this.searchText = this.user.type === 'Freelancer' ? 'Buscar Jobs' : 'Buscar Freelancers';

      if (typeof this.user.photo === 'number') id = this.user.photo;

      if(typeof this.user.photo !== 'number') id = this.user.photo.id;

      this.uploadService.getById(id).subscribe(
        success => {
          this.user.photo = success;
        },
        error => console.error(error)
      );

      this.notificationService.listNotRead(this.user.id).subscribe(
        success => {
          success.forEach((item, index) => {
            this.notifications.push(new Notification(item))
          });

        }, 
        error => {
        console.error(error);
      });

      this.chatService.getMessagesNotRead(this.user.id).subscribe(
        success => {
          this.messagesNotRead = success.filter(message => message.read_at === null);
          this.messagesNotRead.forEach((item, index) => {
            this.messagesNotRead[index].sender = new User(item.sender);
          });
        },
        error => console.error(error)
      )


    }
  }

  search() {
    if (this.user.type === 'Cliente') {
      this.router.navigateByUrl("search/freela");
    }
    if (this.user.type === 'Freelancer') {
      this.router.navigateByUrl("search/job");
    }
  }


  openMessages() {
    this.showNotifications = false;
    this.showMessages = !this.showMessages;
  }
  openNotifications() {
    this.showMessages = false;
    this.showNotifications = !this.showNotifications;
  }

  goToMessage(event, notification) {
    let host = location.hostname;
    const protocol = location.protocol

    host = host === 'localhost' ? `${protocol}//${host}:4200` : `${protocol}//${host}`;

    const link = host + '/' + event.target.id;

    this.notificationService.updateStatusRead(notification).subscribe(
      success => window.location.href = link,
      error => console.error('Erro ao abrir notificação')
    
      )
  }

  redirect() {
    if (this.menu == 'no-logged') {
      this.router.navigate(['']);
    }

    if (this.menu == 'logged') {
      this.router.navigate(['/dashboard']);
    }
  }
}
