import { ChatModel } from '../../../models/chat.model';
import { RunToastUtil } from '../../../utils/run-toast.util';
import { ChatService } from '../../../services/chat.service';
import { JobStatusEnum } from '../../../utils/enums/job-status.enum';
import { ProposalService } from '../../../services/proposal.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { UploadService } from '../../../services/upload.service';
import { NotificationService } from '../../../services/notification.service';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';
import { Proposal } from '../../../models/propsal.model';
import { Component, Input, OnInit } from '@angular/core';
import { Notification } from '../../../models/user.model';
import { ENV } from '../../../../environments/environment';

@Component({
  selector: 'app-proposal-list-card',
  templateUrl: './proposal-list-card.component.html',
  styleUrls: ['./proposal-list-card.component.scss']
})
export class ProposalListCardComponent implements OnInit {

  @Input() proposal: Proposal;
  @Input() job: Job;
  @Input() index: number = 0;
  freela: User;
  photoUrl: string;
  showActionsJob: boolean = false;
  statusColor: string;
  statusToShow: string;
  proposalExpanded: boolean = false;
  userLogged: User;

  constructor(
    private jobService: JobService,
    private notificationService: NotificationService,
    private uploadService: UploadService,
    private userService: UserService,
    private toastrService: ToastrService,
    private router: Router,
    private proposalService: ProposalService,
    private chatService: ChatService,
    private runToastUtil: RunToastUtil
  ) { }

  ngOnInit(): void {
    this.userLogged = JSON.parse(localStorage.getItem('user'));

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if(this.showActionsJob && target.id !== `ul${this.index}` && target.id !== `div${this.index}` && target.id !== `svg${this.index}` && target.id !== `circle1${this.index}` && target.id !== `circle2${this.index}` && target.id !== `circle3${this.index}`) {
        this.showActionsJob = false;
      }
    });
  }

  acceptProposal(proposal: Proposal) {

    proposal.status = 'Aceita';

    const actualDate = new Date();
    const deadlinetime = this.job.type === 'Hora' ? (proposal.term * 3600 * 1000) : (proposal.term * 86400 * 1000) ;

    const deadlineDate = new Date((actualDate.getTime() + deadlinetime));

    this.job.status = 'aguardando_pagamento';
    this.job.freelancer = proposal.freelancer;
    this.job.deadline = deadlineDate;
    this.job.agreed_value = (proposal.value - proposal.value * 0.15);
    this.job.valueJob = proposal.value;
    if (this.job.type === 'Hora') {
      this.job.hours = proposal.term;
    }

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.notificationService.notify(
          new Notification({
            job: this.job,
            user: this.job.freelancer,
            text: `'${this.job.owner.name}' aceitou sua proposta no projeto '${this.job.title}'.`,
            read: false,
            link: `dashboard`
          })
        ).subscribe(
          success => console.log(success),
          error => console.error(error)
        );
        this.recuseOtherProposals(proposal.id);

      },
      error => {
        this.runToastUtil.error(1000, 'Erro ao aceitar proposta');
        console.error(error);
        // this.router.navigateByUrl('dashboard');
      }
    )
  }

  recuseOtherProposals(proposalId: number) {
    for (const [index, item] of this.job.proposals.entries()) {

      if (item.id === proposalId) {
        item.status = 'Aceita';

        this.proposalService.update(item).subscribe(
          success => {
            console.log(['Proposata editada com sucesso', success])
          },
          error => {
            console.error(['Erro ao editar proposta', error])
          }
        );
      }
      else if (item.id !== proposalId) {
        item.status = 'Recusada';

        this.proposalService.update(item).subscribe(
          success => {
            console.log(['Proposata editada com sucesso', success])
          },
          error => {
            console.error(['Erro ao editar proposta', error])
          }
        );
      }
    }

    this.runToastUtil.success(2000, 'Proposta aceita com sucesso! Redirecionando para a tela de pagamento');
    
    const item = `Pagamento Projeto - '${this.job.title}'` ;
    const price = this.job.valueJob;
    const type = 'payment_job';
    
    setTimeout(() => {
      this.router.navigateByUrl(`/checkout/${item}/${price}/${type}/${this.job.id}`);
    }, 2000);
  }

  rejectProposal(proposal: Proposal) {

    proposal.status = 'Recusada';

    this.proposalService.update(proposal).subscribe(
      success => {
        this.runToastUtil.success(1000, 'Proposata recusada com sucesso')
        console.log(['Proposata recusada com sucesso', success]);
        setTimeout(() => {
          location.reload()
        }, 1000);
      },
      error => {
        this.runToastUtil.error(1000, 'Erro ao recusar proposta');
        console.error(['Erro ao recusar proposta', error]);
        setTimeout(() => {
          location.reload()
        }, 1000);
      }
    );
  }


  // Fluxo do chat (verificação de existencia e criação caso não exista)
  contactFreelancer() {
    
    this.chatService.getChatsByParticipant1(this.userLogged.id).subscribe(
      success => {
        // Caso ache o cliente como participante 1 de um chat
        if (success.length > 0) {
          this.findFreelancerLikeParticipant2(success);
        }
        
        else {
          // Procura cliente como participante 2
          this.chatService.getChatsByParticipant2(this.userLogged.id).subscribe(
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
    response = response.filter(item => item.participant2.id === this.proposal.freelancer.id);

    if (response.length > 0) {
      this.router.navigateByUrl(`chats/${response[0].id}`);
    }
    else {
      this.createNewChat();
    }
  }

  findFreelancerLikeParticipant1(response: ChatModel[]) {
    response = response.filter(item => item.participant1.id === this.proposal.freelancer.id);


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
        participant2: this.proposal.freelancer,
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

  

  

  

}
