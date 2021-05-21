import { ChatService } from '../../../services/chat.service';
import { NotificationService } from '../../../services/notification.service';
import { QuestionService } from '../../../services/question.service';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { Notification, User } from '../../../models/user.model';
import { Job } from '../../../models/job.model';
import { Component, OnInit } from '@angular/core';
import { Question } from '../../../models/questions.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-send-question',
  templateUrl: './send-question.component.html',
  styleUrls: ['./send-question.component.scss']
})
export class SendQuestionComponent implements OnInit {

  ready: boolean = false;
  freelancer: User;
  jobDetails: Job; 
  alreadySentQuestion = false;
  hideShow: boolean = false;

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private toastrService: ToastrService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.getJobInfos(params['jobID']);
    });

    
  }

  getJobInfos(jobId: number) {
    this.chatService.getByJob(jobId).subscribe(
      success => {
        if (success.length > 0) {
          this.alreadySentQuestion = true;
          this.runError('Você já fez uma pergunta sobre esse projeto! Você será redirecionado para o chat', 'Ops! Algo deu errado');
          setTimeout(() => {
            this.router.navigateByUrl(`chats/${success[0].id}`);
          }, 5000)
        }
      },
      error => console.error(error)
    );

    this.jobService.details(jobId).subscribe(
      (result) => {
        this.jobDetails = result;
        this.laodFreelancerdata();

      },  
      (error) => {
        console.error(error);
      }
    );
  }

  laodFreelancerdata() {
    this.freelancer = JSON.parse(localStorage.getItem("user"));
    this.ready = true;
  }

  sendQuestion() {

    if (this.alreadySentQuestion) {
      return;
    }
    
    const question = document.getElementById('question') as HTMLTextAreaElement;

    console.log(question.value);
    
    if (question.value === '') {
      this.runError('Por favor, preencha a questão', 'Ops! Algo deu errado');
      return;
    }

     const newQuestion = new Question({
       question: question.value,
       freelancer: this.freelancer,
       job: this.jobDetails
     });

     this.questionService.new(newQuestion).subscribe(
       (result) => {
          alert('Pergunta enviada!');
          this.alreadySentQuestion = true;
          this.createChat(question.value);
       },
       (error) => {
         console.error(error);
       }
     )
  }

  createChat(question: string){
    let chatId: number = null;
    
    //Verifico se já existe um chat entre eles
    this.chatService.getChatsByParticipant1(this.freelancer.id).subscribe(
      success => {
        if (success.length !== 0) {
          for (const [index, item] of success.entries()) {
            if (item.participant2.id === this.jobDetails.owner.id) {
              chatId = item.id;
              return;
            }
          }
        }
        if (chatId === null) {
          this.chatService.getChatsByParticipant2(this.freelancer.id).subscribe(
            success => {
              if (success.length > 0) {
                for (const [index, item] of success.entries()) {
                  if (item.participant1.id === this.jobDetails.owner.id) {
                    chatId = item.id;
                    return;
                  }
                }
              }
            },
            error => console.error("Erro ao criar chat", error)
          )
        }


        
      },  
      error => console.error("Erro ao criar chat", error)
    );

    //Se não encontrar chat ativo
    if (chatId === null) {
      this.chatService.createChat({
        participant1: this.freelancer,
        participant2: this.jobDetails.owner,
        job: this.jobDetails,
        messages: []
      }).subscribe(
        success => {
          chatId = success.id;
          this.chatService.sendMessage({
            message: question,
            sender: this.freelancer,
            receiver: this.jobDetails.owner,
            attachments: [],
            read_at: null,
            chat: success,
            archived: false,
            favorite: false
          }).subscribe(
            success => this.notify(chatId),
            error => console.error("Erro ao criar chat", error)
          )
        },
        error => console.error("Erro ao criar chat", error)
      )
    }
    else {
      this.chatService.getById(chatId).subscribe(
        success => {
          this.chatService.sendMessage({
            message: question,
            sender: this.freelancer,
            receiver: this.jobDetails.owner,
            attachments: [],
            read_at: null,
            chat: success,
            archived: false,
            favorite: false
          }).subscribe(
            success => this.notify(chatId),
            error => console.error("Erro ao criar chat", error)
          );
        },
        error => console.error("Erro ao criar chat", error)
      )
      
    }
  }

  notify(chatId: number) {
    const notify = new Notification({
      user: this.jobDetails.owner,
      job: this.jobDetails,
      text: `O freelancer '${this.freelancer.name}' fez uma pergunta sobre o projeto '${this.jobDetails.title}'`,
      read: false,
      link: `chats/${chatId}`
    });
    this.notificationService.notify(notify).subscribe(
      (result) => {
        console.log('[Envio de Pergunta] Notificação enviada');
        this.router.navigateByUrl(`chat/${chatId}`);
      },
      (error) => {
        console.error('[Envio de Pergunta] Erro ao enviar notificação');
      }
    )
  }


  runError(message: string, title: string) {
    this.toastrService.error(message, title, {
      progressBar: true
    });
  }

  runSuccess(message: string, title: string) {
    this.toastrService.success(message, title, {
      progressBar: true
    });
  }

}
