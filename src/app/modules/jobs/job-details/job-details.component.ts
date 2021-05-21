import { DisputeService } from '../../../services/dispute.service';
import { RunToastUtil } from '../../../utils/run-toast.util';
import { Proposal } from '../../../models/propsal.model';
import { NotificationService } from '../../../services/notification.service';
import { JobStatusEnum } from '../../../utils/enums/job-status.enum';
import { ProposalService } from '../../../services/proposal.service';
import { UserService } from '../../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '../../../models/job.model';
import { Notification, Rating, User } from '../../../models/user.model';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {
  feedbacks: Array<Rating>;
  job: Job;
  ownerJobs: Job[];
  closed: boolean = false;
  ready: boolean = false;
  proposalExpanded: boolean = false;
  userLogged: User;
  showActionsJob: boolean = false;
  statusColor: string;
  statusToShow: string;
  deadlineLeft: number;
  deadlineLeftHours: number;
  new_deadline: Date;
  daysTotalProject: number;
  timeConcludedByFreela: number;
  showAlert: boolean = false;
  alertTextFreela: string = '';
  alertTextClient: string = '';
  totalRounds: number;
  nextRound: number;
  actualRound: number;
  alreadySentProposal: boolean = false;

  showModalConcludeJob: boolean = false;
  showModalCancelProposal: boolean = false;
  showModalCloseProject: boolean = false;
  showModalStartDispute: boolean = false;
  showModalPauseProject: boolean = false;
  showModalNewDeadlineFreela: boolean = false;
  showModalNewDeadlineClient: boolean = false;

  pauseLimit: number = 0;

  showFeatureUrgent: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private jobService: JobService,
    private userService: UserService,
    private proposalService: ProposalService,
    private notificationService: NotificationService,
    private router: Router,
    private runToastUtil: RunToastUtil,
    private disputeService: DisputeService
  ) { }

  ngOnInit(): void {
    this.userLogged = JSON.parse(localStorage.getItem('user'));

    const jobID = parseInt(this.activatedRoute.snapshot.paramMap.get('jobID'));

    this.jobService.details(jobID).subscribe(
      success => {
        this.job = new Job(success);

        //Redireciona para pagamento automaticamente
        if (this.job.status === 'aguardando_pagamento' && this.job.owner.id === this.userLogged.id) {
          this.runToastUtil.warning(2000, 'Projeto pendente de pagamento, redirecionando...');
          setTimeout(() => {
            this.pay();
          }, 2000);
          
        }

        //Redireciona para freela avalia cliente
        if (this.job.status === '' && this.userLogged.id === this.job.freelancer.id && !this.job.freela_rated) {
          this.runToastUtil.warning(2000, 'Você precisa avaliar o cliente desse projeto, redirecionando...');
          setTimeout(() => {
            this.router.navigate([`/job/${this.job.id}/rating`]);
          }, 2000);
        }

        //Redireciona para cliente avaliar freela
        if (this.job.status === '' && this.userLogged.id === this.job.owner.id && !this.job.client_rated) {
          this.runToastUtil.warning(2000, 'Você precisa avaliara o freelancer desse projeto, redirecionando....');
          setTimeout(() => {
            this.router.navigate([`/job/${this.job.id}/rating`]);
          }, 2000);
        }
        this.deadlineLeft = this.job.getDeadLineLeftDays();
        this.deadlineLeftHours = this.job.getDeadLineLeftHours();
        this.daysTotalProject = this.job.getTimeProjectDays();
        
        //Rodadas - projeto por hora
        if (this.job.type === 'Hora') {
          this.totalRounds = Math.round(this.job.hours / 24);
          const roundsLeft = this.deadlineLeftHours / 24;

          this.actualRound = Math.round(this.totalRounds - roundsLeft);
          const hourDeadline = new Date(this.job.deadline).getHours();
          const hourNow = new Date().getHours();
          console
          this.nextRound = Math.abs(24 - Math.abs(hourNow - hourDeadline));

        }


        //Regra de deadlines para o job conforme descrito no trello
        if (this.job.status === 'em_andamento' && this.deadlineLeftHours < 72 && this.job.type !== 'Hora') {      
          this.showAlert = true;

          if (this.deadlineLeftHours < 72 && this.deadlineLeftHours >= 0) {
            // Prazo de 3 dias antes do termino para o freelancer concluir o projeto ou solicitar mais prazo 

            this.alertTextClient = `O prazo desse projeto acaba em ${this.deadlineLeftHours} horas. 
                                    O freelancer deve solicitar um novo prazo ou conclui-lo até a data 
                                    ${new Date(this.job.deadline).toLocaleDateString('pt-br')}. Fique atento!`;
                                    
            this.alertTextFreela = `O prazo desse projeto acaba em ${this.deadlineLeftHours} horas. 
                                    Você deve solicitar um novo prazo ou conclui-lo até a data 
                                    ${new Date(this.job.deadline).toLocaleDateString('pt-br')}.`
            
          }

          if (this.deadlineLeftHours < 0 && this.deadlineLeftHours > -72) {
            //Prazo de 3 dias a mais para o freelancer concluir o projeto ou solicitar mais prazo

            const timeLeft = 72 + this.deadlineLeftHours;
            const limitDateTime = new Date(this.job.deadline).getTime() + (72*1000*3600);
            const limitDate = new Date(limitDateTime);

            this.alertTextClient = `O prazo desse projeto encerrou faz 
                                    ${Math.abs(this.deadlineLeftHours)} horas. 
                                    O freelancer até a data ${limitDate.toLocaleDateString('pt-br')} 
                                    (${timeLeft} horas restantes) para solicitar um novo prazo, caso o contrário, 
                                    se iniciará a disputa.`;

            this.alertTextFreela = `O prazo desse projeto encerrou faz 
                                    ${Math.abs(this.deadlineLeftHours)} horas. 
                                    Você tem até a data ${limitDate.toLocaleDateString('pt-br')} 
                                    (${timeLeft} horas restantes) para solicitar um novo prazo, caso o contrário, 
                                    se iniciará a disputa.`
          }
          else {
           this.startDispute(true);
          }

        }

        if (this.job.status === 'concluido_pelo_freelancer') {
          // Aviso de tempo para o cliente responder a solicitação de conclusão do projeto feito pelo freelancer
          //caso não responda em 72 horas, vai para disputa automatico
          
          this.timeConcludedByFreela = this.job.getTimeConcludedByFreela();

          this.showAlert = true;
          
          if (this.timeConcludedByFreela >= 0 && this.timeConcludedByFreela < 72) {
            // Está no prazo para o cliente responder 

            const timeLeft = 72 - this.timeConcludedByFreela;
            const limitDateTime = new Date(this.job.date_concluded_by_freela).getTime() + (72*1000*3600);
            const limitDate = new Date(limitDateTime);
            
            this.alertTextClient = `O freelaner concluiu o projeto há ${this.timeConcludedByFreela} horas.
                                    Você tem até ${limitDate.toLocaleDateString('pt-br')} 
                                    (${timeLeft} horas restantes) para aceitar a conclusão ou iniciar uma disputa.
                                    caso contrário, a disputa será iniciada automaticamente`;

            this.alertTextFreela = `Você concluiu o projeto há ${this.timeConcludedByFreela} horas.
                                    O cliente tem até ${limitDate.toLocaleDateString('pt-br')} 
                                    (${timeLeft} horas restantes) para aceitar a conclusão ou iniciar uma disputa.
                                    caso contrário, a disputa será iniciada automaticamente`;

          }
          else if (this.timeConcludedByFreela > 72) {
            this.startDispute(true);
          }
          
        }


        this.statusToShow = this.job.status.replace(/\_/g, ' ');
        (this.job.proposals)
        this.getFeedbacks();
      }, 
      error => {
        console.log(['Erro ao recuperar dados do projeto', error]);
      });
  }

  actionModal(value: string) {
  }

  // Listagem dos feedbacks dos freelancer em relação ao cliente
  getFeedbacks() {
    let ownerId;
    
    ownerId = (typeof this.job.owner === 'number') ? this.job.owner : this.job.owner.id;

    this.userService.getById(ownerId).subscribe (
      success => {
        this.job.owner = success;

        for (const [index, item] of this.job.owner.ratings.entries()) {

          let userId = (typeof item.user === 'number') ? item.user : item.user.id;
          let valuerId = typeof item.valuer === 'number' ? item.valuer : item.valuer.id;

          this.userService.getById(valuerId).subscribe(
            success => {
              this.job.owner.ratings[index].valuer = new User(success);
              this.job.owner.ratings[index].valuer.averageRating = new Array<number>(this.job.owner.ratings[index].valuer.getMediaRating());
              this.job.owner.ratings[index].averageRating = new Array<number>(this.job.owner.ratings[index].rating);

              let jobId = typeof item.job === 'number' ? item.job : item.job.id;
              
              this.jobService.getById(jobId).subscribe(
                success => {
                  this.job.owner.ratings[index].job = success;

                },
                error => {
                  console.error(['Erro ao recuperar dados do job da avaliação do cliente', error])
                }
              )
            },
            error => {
              console.error(['Erro ao recuperar dados de user da avaliação do cliente', error])
            }
          );

          // this.userService.getById(valuerId).subscribe(
          //   success => {
          //     this.job.owner.ratings[index].valuer = new User(success)
          //   },
          //   error => {

          //   }
          // )
        }
        this.getOwnerJobs();

      },
      error => {
        console.error(['Erro ao recuperar dados do client', error])
      }
    );
    

  }

  // Tras outros jobs do cliente
  getOwnerJobs() {
    
    this.jobService.myJobs(this.job.owner).subscribe(
      success => {
        this.ownerJobs = success;
        this.getProposals();
      },
      error => console.error(error)
    )
  }

  //Pega as proposatas do job
  getProposals() {
    if (this.job.proposals.length === 0) {
      this.getColorStatus();
      return;
    }
    
    for (const [index, item] of this.job.proposals.entries()) {

      this.proposalService.getByID(item.id).subscribe(
        success => {
          this.job.proposals[index] = success;

          if (this.job.proposals[index].status === 'Aberta') this.job.proposals[index].color = '#363636';
          if (this.job.proposals[index].status === 'Aceita') this.job.proposals[index].color = '#1ABF00';
          if (this.job.proposals[index].status === 'Recusada') this.job.proposals[index].color = '#C10505';

          if (this.job.proposals[index].freelancer.id === this.userLogged.id) {
            this.alreadySentProposal = true;
          }

          this.userService.getById(this.job.proposals[index].freelancer.id).subscribe(
            success => {
              this.job.proposals[index].freelancer = new User(success);
              this.job.proposals[index].freelancer.averageRating = new Array<number>(this.job.proposals[index].freelancer.getMediaRating());
              
              if (index === (this.job.proposals.length - 1)) {
                this.getColorStatus();
              }
            },
            error => {
              console.error(['Erro ao recuperar dados do freelancer', error])
            }
          );
        },
        error => {
          console.error(['Erro ao recuperar infromações da proposta', error]);
        }
      );
    }

    

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
    if (this.job.status === JobStatusEnum.rodada_fechada) this.statusColor = 'yellow';
    if (this.job.status === JobStatusEnum.pausado) this.statusColor = '#363636';
    this.ready = true;
  }

  responseModalDeadline(event) {
    if (event === 'close') {
      this.showModalNewDeadlineFreela = false;
    }

    if (event.type && event.type === 'request') {
      this.new_deadline = new Date(event.new_deadline);
     
      this.newDeadLine();

    }

    if (event === 'recuse') {
      this.showModalNewDeadlineClient = false;
      this.recuseNewDeadline();
    }

    if (event === 'accept') {
      this.showModalNewDeadlineClient = false;
      this.acceptNewDeadLine();
    }

  }

  //Ações dos botões

  newDeadLine() {
    this.job.new_deadline = this.new_deadline;
    this.job.status = JobStatusEnum.novo_prazo;

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.showModalNewDeadlineFreela = false;
        this.runToastUtil.success(2000, 'Novo prazo solicitado com sucesso');
        setTimeout(() => {
          location.reload()
        }, 2000)
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao solicitar novo prazo');
        console.error(['Erro ao solicitar novo prazo', error])
      }
    )
  }

  recuseNewDeadline() {
    this.job.new_deadline = null;
    this.job.status = JobStatusEnum.ativo;

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Novo Prazo recusado');

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
        this.runToastUtil.error(2000, 'Erro ao recusar novo prazo');
      }
    )
  }

  acceptNewDeadLine() {
    this.job.deadline = this.job.new_deadline;
    this.job.new_deadline = null;
    this.job.status = JobStatusEnum.andamento;

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Novo Prazo aceito');

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
        this.runToastUtil.error(2000, 'Erro ao aceitar novo prazo');
      }
    )
  }

  concludeJobFreela() {
    this.job.status = JobStatusEnum.concluido_freela;
    this.job.date_concluded_by_freela = new Date();

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Job concluído com sucesso');
        setTimeout(() => {
          this.router.navigateByUrl('dashboard');
        }, 2000)
      },
      error => {
        this.runToastUtil.error(2000, 'Algo deu errado na conclusão desse job');
        console.error(['Algo deu errado na conclusão desse job', error]);
      }
    );
  }

  concludeJobClient() {

    this.job.freelancer.level = Number(this.job.freelancer.level) + 1;
    this.job.owner.level = Number(this.job.owner.level) + 1;

    //Implementar Stripe
    this.job.freelancer.freelancer_earning = Number(this.job.freelancer.freelancer_earning) + this.job.agreed_value;
    this.job.owner.client_spending = Number(this.job.owner.client_spending) + this.job.agreed_value;
    
   
    this.userService.update(this.job.freelancer).subscribe(
      success => {
        console.log(['Level do Freelancer atualizado com sucesso', success]);
        if(this.userLogged.type === 'Freelancer') {
          localStorage.setItem('user', JSON.stringify(this.job.freelancer));
        }
      },
      error => {
        console.error(['Erro ao atualizar level do freelancer', error])
      }
    );

    this.userService.update(this.job.owner).subscribe(
      success => {
        console.log(['Level do Cliente atualizado com sucesso', success]);
        if(this.userLogged.type === 'Cliente') {
          localStorage.setItem('user', JSON.stringify(this.job.owner));
        }
      },
      error => {
        console.error(['Erro ao atualizar level do cliente', error])
      }
    );

    this.job.status = JobStatusEnum.concluido;
    
    this.jobService.update(this.job.id, this.job).subscribe(
      (success) => {
        this.runToastUtil.success(2000, 'Job concluído com sucesso! Você será redirecionado');
        setTimeout(() => {
          this.router.navigate([`/job/${this.job.id}/rating`]);
        }, 2000)
        
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao concluir porjeto');
        console.error(['Erro ao concluir porjeto', error]);
      }
    )
  }

  pauseProjectFreela(confirmed?: boolean) {
    this.pauseLimit = this.job.hours >= 24 ? 24 : this.job.hours;

    if (this.job.time_paused >= this.pauseLimit) {
      this.runToastUtil.error(2000, `Projeto já foi pausado pelo limite de tempo: ${this.pauseLimit} horas`);
    }

    this.pauseLimit = this.pauseLimit - this.job.time_paused;

    if (confirmed) {
      this.job.status = 'pausado';
      if (this.job.time_paused === 0) {
        this.job.paused_in = new Date();
      }

      this.jobService.update(this.job.id, this.job).subscribe(
        success => {
          this.runToastUtil.success(2000, 'Projeto pausado com sucesso');
          setTimeout(() => {
            this.router.navigateByUrl('/dashboard');
          }, 2000);
        },
        error => {
          this.runToastUtil.error(2000, 'Erro ao pausar Projeto');
          console.error(['Erro ao pausar Projeto', error])
        }
      );
      return;
    }

    this.showModalPauseProject = true;

  }

  unpauseProjectFreela() {
    const timePaused = this.job.getPausedTimeHours();

    this.job.status = 'em_andamento';
    this.job.time_paused += timePaused;
    
    const new_deadline = (new Date(this.job.deadline).getTime()) + (timePaused * 1000 * 3600);
    
    this.job.deadline = new Date(new_deadline);

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Projeto retomado com sucesso');
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao retomar projeto');
        console.error(['Erro ao retomar projeto', error])
      }
    )

  }

  pay() {
    const item = `Pagamento Projeto - '${this.job.title}'` ;
    const price = this.job.valueJob;
    const type = 'payment_job';

    this.router.navigateByUrl(`/checkout/${item}/${price}/${type}/${this.job.id}`);

  }

  startDispute(auto: boolean) {
    let next: boolean;

    if (auto) {
      next = true;
    }
    else if (!auto) {
      next = confirm('Contestar a conclusão de um projeto, iniciará uma disputa. Deseja realmente contestar? ');
    }

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

        this.jobService.update(this.job.id, this.job).subscribe(
          success => {
            this.runToastUtil.success(2000, 'Dispute iniciada! Redirecionando...');
            setTimeout(() => {
              this.router.navigateByUrl(`dispute/${dispute.id}`); 
            }, 2000);
            
          },
          error => {
            this.runToastUtil.error(2000, 'Ocorreu algum erro durante o processo');
            console.error(['Erro ao atualizar job após inicio disputa', error])
          }
        );
      },
      error => {
        console.error(['Erro ao criar disputa', error])
      }
    );
  }

  cancelProposal() {
    const myProposal = this.job.proposals.filter(item => item.freelancer.id === this.userLogged.id);
 
    this.proposalService.delete(myProposal[0].id).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Proposta cancelada com sucesso');
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao cancelar proposta');
        console.error(['Erro ao cancelar proposata', error])
      }
    );
     
  }
  editProposal() {
    const myProposal = this.job.proposals.filter(item => item.freelancer.id === this.userLogged.id);

    this.router.navigateByUrl(`job/${myProposal[0].id}/${this.job.id}/edit-proposal`);
  }

  cancelProject() {

  }

  closeProject() {
    if (this.userLogged.type === 'Freelancer') {
      const freela = new User(this.job.freelancer);
      freela.level = freela.level - 3;
      // Implementar Stripe
      this.job.owner.client_spending -= this.job.valueJob;

      this.job.status = JobStatusEnum.fechado_freela;
      this.job.freelancer = null;

      this.jobService.update(this.job.id, this.job).subscribe(
        success => {
          this.userService.update(freela).subscribe(
            success => {
              this.userService.update(this.job.owner).subscribe(
                success => {
                  this.runToastUtil.success(2000, 'Projeto fechado com sucesso!');
                  setTimeout(() => {
                    this.router.navigateByUrl('dashboard');
                  }, 2000);
                },
                error => {
                  this.runToastUtil.error(2000, 'Erro ao fechar projeto');
                  console.error(['Erro ao atualizar owner', error])
                }
              )
            },  
            error => {
              this.runToastUtil.error(2000, 'Erro ao fechar projeto');
              console.error(['Erro ao atualizar freelancer', error])
            }
          )
        },
        error => {
          this.runToastUtil.error(2000, 'Erro ao fechar projeto');
          console.error(['Erro ao atualizar usuário', error])
        }
      )
    }

    if (this.userLogged.type === 'Cliente') {
      this.job.status = JobStatusEnum.fechado_cliente;
      this.job.freelancer = null;

      this.jobService.update(this.job.id, this.job).subscribe(
        success => {
          this.runToastUtil.success(2000, 'Projeto fechado com sucesso');
          setTimeout(() => {
            this.router.navigateByUrl('dashboard');
          }, 2000);
        },
        error => {
          this.runToastUtil.error(2000, 'Erro ao fechar projeto');
          setTimeout(() => {
            location.reload();
          }, 2000);
          console.error(['Erro ao fechar projeto', error])
        }
      )
    }
    
  }

  buyFeatured() {

  }

  getEventTypeJob(event) {
    if (event === 'continue') {
      this.showFeatureUrgent = false;
      return;
    }

    if (event === 'featured') {
      const item = 'Pacote de Destaque - 5 dias';
      const price = 10;
      const type = 'featured';
      this.router.navigateByUrl(`/checkout/${item}/${price}/${type}/${this.job.id}`);
      return;
    }

    if (event === 'urgent') {
      const item = 'Pacote de Urgência';
      const price = 15;
      const type = 'urgent';
      this.router.navigateByUrl(`/checkout/${item}/${price}/${type}/${this.job.id}`);
      return;
    }
  }

  rate() {
    this.router.navigateByUrl(`job/${this.job.id}/rating`);
  }

  clientRateFreela() {

  }

  responseModal(event: string, action: string) {
    
    if (event === 'hide') {
      this.showModalCancelProposal = false;
      this.showModalConcludeJob = false;
      this.showModalStartDispute = false;
      this.showModalCloseProject = false;
      this.showModalPauseProject = false;
      return;
    }

    if (action === 'conclude') {
      if (this.userLogged.type === 'Freelancer') {
        this.concludeJobFreela();
        return;
      }
      else if (this.userLogged.type === 'Cliente') {
        this.concludeJobClient();
        return;
      }
      return;
    }

    if (action === 'dispute') {
      this.startDispute(true);
      return;
    }

    if (action === 'cancel') {
      this.cancelProject();
      return;
    }

    if (action === 'close') {
      this.closeProject();
      return;
    }

    if (action === 'pause') {
      this.pauseProjectFreela(true);
      return;
    }

    if (action === 'unpause') {
      this.unpauseProjectFreela();
      return;
    }

    if (action === 'cancelProposal') {
      this.showModalCancelProposal = false;
      this.cancelProposal();
    }
  }
}
