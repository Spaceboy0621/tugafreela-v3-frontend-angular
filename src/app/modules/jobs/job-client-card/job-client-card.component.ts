import { RunToastUtil } from './../../../utils/run-toast.util';
import { User } from './../../../models/user.model';
import { ProposalService } from './../../../services/proposal.service';
import { UserService } from '../../../services/user.service';
import { ChatModel } from '../../../models/chat.model';
import { ChatService } from '../../../services/chat.service';
import { DisputeService } from '../../../services/dispute.service';
import { JobStatusEnum } from '../../../utils/enums/job-status.enum';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../services/notification.service';
import { JobService } from '../../../services/job.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'src/app/models/job.model';
import { Notification } from 'src/app/models/user.model';

@Component({
  selector: 'app-job-client-card',
  templateUrl: './job-client-card.component.html',
  styleUrls: ['./job-client-card.component.scss']
})
export class JobClientCardComponent implements OnInit{

  @Input() job: Job;

  showActionsJob: boolean = false;
  showMessageNotActions: boolean = false;
  timeProject: number;
  statusColor: string;
  statusToShow: string;
  showDispute: boolean = false;
  messagesJob: Array<ChatModel> = [];
  messagesNumber: number = 0;
  proposalsNumber: number = 0;

  ulActions: HTMLElement;
  @Input() index: number;
  user: User;

  constructor(
    private router: Router,
    private jobService: JobService,
    private notificationService: NotificationService,
    private toastrService: ToastrService,
    private disputeService: DisputeService,
    private chatService: ChatService,
    private userService: UserService,
    private proposalService: ProposalService,
    private runToastUtil: RunToastUtil
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));

    const actualDate = new Date();
    const jobCreateDate = new Date(this.job.created_at.toString());
    const diffTime = actualDate.getTime() - jobCreateDate.getTime();

    this.timeProject = (diffTime / 1000 / 3600);
    this.statusToShow = this.job.status.replace(/\_/g, ' ');
    this.getColorStatus();

    //Close actions on click out
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if(this.showActionsJob && target.id !== `ul${this.index}` && target.id !== `div${this.index}` && target.id !== `svg${this.index}` && target.id !== `circle1${this.index}` && target.id !== `circle2${this.index}` && target.id !== `circle3${this.index}`) {
        this.showActionsJob = false;
      }
    });

  }

  getMessages() {
    this.chatService.getByJob(this.job.id).subscribe(
      success => {
        this.messagesJob = success;

        for (const [index, item] of this.messagesJob.entries()) {
          this.messagesNumber += Number(item.messages.length);
        }
      }, 
      error => {
        console.error(['Erro ao recuperar mensagens', error])
      }
    )
  }

  getProposals() {
    this.proposalService.getByJob(this.job).subscribe(
      success => {
        this.proposalsNumber = success.length;
      },
      error => {
        console.error(['Erro ao recuperar quantidade de propostas do job', error])
      }
    )
  }

  getColorStatus() {
    if (this.job.status === JobStatusEnum.ativo) this.statusColor = 'green';
    if (this.job.status === JobStatusEnum.pagamento) this.statusColor = 'yellow';
    if (this.job.status === JobStatusEnum.andamento) this.statusColor = 'green';
    if (this.job.status === JobStatusEnum.novo_prazo) this.statusColor = 'orange';
    if (this.job.status === JobStatusEnum.concluido_freela) this.statusColor = 'yellow';
    if (this.job.status === JobStatusEnum.concluido) this.statusColor = 'blue';
    if (this.job.status === JobStatusEnum.fechado_cliente) this.statusColor = 'red';
    if (this.job.status === JobStatusEnum.fechado_freela) this.statusColor = 'red';
    if (this.job.status === JobStatusEnum.cancelado) this.statusColor = 'black';
    if (this.job.status === JobStatusEnum.disputa) this.statusColor = 'orange';
    if (this.job.status === JobStatusEnum.fechado_para_cliente) this.statusColor = 'brown';
    if (this.job.status === JobStatusEnum.fechado_para_freela) this.statusColor = 'brown';
    if (this.job.status === JobStatusEnum.fechado_divisao) this.statusColor = 'brown';
    
    this.getMessages();
    this.getProposals();
  }

  openActionsJob() {
    const ulChildren = document.getElementById(`ul${this.index}`);
    
    if (ulChildren.children.length <= 1) {
      this.showMessageNotActions = true;
    }
    else {
      this.showMessageNotActions = false;
    }

    this.showActionsJob = !this.showActionsJob;
  }

  goToDetails(jobID) {
    this.router.navigateByUrl(`job/${jobID}`);
  }


  editJob() {
    if (new Job(this.job).getTimeCreated() > 1) {
      this.runError('Não é possível editar projetos após 24 horas de sua criação', 'Ops! Algo deu errado');
      return;
    }
    this.router.navigate([`/job/${this.job.id}/edit-job`])
  }

  closeJob() {
    
    const newDispute = {
      job: this.job.id,
      phase: 'first',
      status: 'open',
      percentage_freela: 0,
      percentage_owner: 0,
      messages: [],
      deal_proposed_by: null,
      deal_proposal: 'none',
      messages_moderator: [],
      justification: ''
    };

    this.disputeService.create(newDispute).subscribe(
      success => {
        let dispute = success;
        this.job.dispute = dispute.id;
        this.job.status = JobStatusEnum.disputa;

        this.jobService.update(this.job.id, this.job).subscribe(
          success => {
            this.runSuccess('Projeto fechado com sucesso! Redirecionando para a tela de disputa', 'Boa! Tudo certo');
            setTimeout(() => {
              this.router.navigateByUrl(`dispute/${dispute.id}`); 
            }, 5000);
            
          },
          error => this.runError('Ocorreu algum erro durante o processo', 'Ops! Algo deu errado')
        );
      },
      error => console.error('Error ao criar disputa', error)
    );

    

  }

  concludeJob() {

    this.job.freelancer.level = Number(this.job.freelancer.level) + 1;
    this.job.owner.level = Number(this.job.owner.level) + 1;

    this.userService.update(this.job.freelancer).subscribe(
      success => {
        console.log(['Level do Freelancer atualizado com sucesso', success])
      },
      error => {
        console.error(['Erro ao atualizar level do freelancer', error])
      }
    );

    this.userService.update(this.job.freelancer).subscribe(
      success => {
        console.log(['Level do Cliente atualizado com sucesso', success])
      },
      error => {
        console.error(['Erro ao atualizar level do cliente', error])
      }
    );


    this.job.status = JobStatusEnum.concluido;
    
    this.jobService.update(this.job.id, this.job).subscribe(
      (success) => {
        this.runSuccess('Job concluído com sucesso! Você será redirecionado', 'Eba! Deu tudo certo');
        setTimeout(() => {
          this.router.navigate([`/job/${this.job.id}/rating`]);
        }, 5000)
        
      },
      error => console.error(error)
    );
    
  }

  recuseConcludedFreela() {

    const next = confirm('Contestar a conclusão de um peojeto, iniciará uma disputa. Deseja realmente contestar? ');

    if (!next) {
      return;
    }
    

    this.job.status = JobStatusEnum.disputa;
    
    const newDispute = {
      job: this.job.id,
      phase: 'first',
      status: 'open',
      percentage_freela: 0,
      percentage_owner: 0,
      messages: [],
      deal_proposed_by: null,
      deal_proposal: 'none',
      messages_moderator: [],
      justification: ''
    };

    this.disputeService.create(newDispute).subscribe(
      success => {
        let dispute = success;
        this.job.dispute = dispute.id;

        this.showActionsJob = !this.showActionsJob;

        this.jobService.update(this.job.id, this.job).subscribe(
          success => {
            this.showDispute = true;
            this.runSuccess('Conclusão contestada! Redirecionando para a tela de disputa', 'Boa! Tudo certo');
            setTimeout(() => {
              this.router.navigateByUrl(`dispute/${dispute.id}`); 
            }, 5000);
            
          },
          error => this.runError('Ocorreu algum erro durante o processo', 'Ops! Algo deu errado')
        );
      },
      error => console.error('Error ao criar disputa', error)
    );
    

  }

  recuseNewDeadline() {
    this.job.new_deadline = null;
    this.job.status = JobStatusEnum.ativo;

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runSuccess('Novo Prazo recusado', 'Eba! deu tudo certo');

        const notify = {
          user: this.job.freelancer,
          job: this.job,
          text: `O Cliente recusou seu pedido de um novo prazo no projeto ${this.job.title}`,
          read: false,
          link: 'dashboard',
          date_reading: null
        };

        this.notificationService.notify(new Notification(notify)).subscribe(
          success => console.log(['Notificação enviada', success]),
          error => console.error(['Erro ao enviar notificação', error])
        );

        setTimeout(() => {
          location.reload();
        }, 5000)
      },
      error => {
        console.error(['Erro ao recusar novo prazo', error]);
        this.runError('Erro ao recusar novo prazo', 'Ops! Algo deu errado');
      }
    )
  }
  acceptNewDeadLine() {
    this.job.deadline = this.job.new_deadline;
    this.job.new_deadline = null;
    this.job.status = JobStatusEnum.andamento;

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runSuccess('Novo Prazo aceito', 'Eba! deu tudo certo');

        const notify = {
          user: this.job.freelancer,
          job: this.job,
          text: `O Cliente aceitou seu pedido de um novo prazo no projeto ${this.job.title}`,
          read: false,
          link: 'dashboard',
          date_reading: null
        };

        this.notificationService.notify(new Notification(notify)).subscribe(
          success => console.log(['Notificação enviada', success]),
          error => console.error(['Erro ao enviar notificação', error])
        );

        setTimeout(() => {
          location.reload();
        }, 5000)
      },
      error => {
        console.error(['Erro ao aceitar novo prazo', error]);
        this.runError('Erro ao aceitar novo prazo', 'Ops! Algo deu errado');
      }
    )
  }

  contactFreelancer() {
    
    this.chatService.getChatsByParticipant1(this.user.id).subscribe(
      success => {
        // Caso ache o cliente como participante 1 de um chat
        if (success.length > 0) {
          this.findFreelancerLikeParticipant2(success);
        }
        
        else {
          // Procura cliente como participante 2
          this.chatService.getChatsByParticipant2(this.user.id).subscribe(
            success => {
              if (success.length > 0) {
                this.findFreelancerLikeParticipant1(success);
              }
              else {
                this.createNewChat();
              }
            },
            error => {
              console.error(['Erro ao encontrar cleinte como participante em algum chat', error])
            }
          );
        }
      },
      error => {
        this.runToastUtil.error(1000, 'Erro ao contatar freelancer');
        console.error(['Erro ao contatar freelancer', error]);
      }
    );
  }

  findFreelancerLikeParticipant2(response: ChatModel[]) {
    response = response.filter(item => item.participant2.id === this.job.freelancer.id);

    if (response.length > 0) {
      this.router.navigateByUrl(`chats/${response[0].id}`);
    }
    else {
      this.createNewChat();
    }
  }

  findFreelancerLikeParticipant1(response: ChatModel[]) {
    response = response.filter(item => item.participant1.id === this.job.freelancer.id);


    if (response.length > 0) {
      this.router.navigateByUrl(`chats/${response[0].id}`);
    }
    else {
      this.createNewChat();
    }
  }

  createNewChat() {
    this.chatService.createChat(
      new ChatModel({
        participant1: this.job.owner,
        participant2: this.job.freelancer,
        job: this.job,
        messages: []
      })
    ).subscribe(
      success => {
        console.log(['Chat criado com sucesso', success]);
        this.router.navigateByUrl(`chats/${success.id}`);
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao iniciar chat com o freelancer. Tente novamente mais tarde');
        console.error(['Erro ao criar chat', error]);
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    );
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
