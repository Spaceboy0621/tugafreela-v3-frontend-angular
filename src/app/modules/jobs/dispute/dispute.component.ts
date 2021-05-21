import { UploadService } from '../../../services/upload.service';
import { JobStatusEnum } from '../../../utils/enums/job-status.enum';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../models/user.model';
import { DisputeService } from '../../../services/dispute.service';
import { Dispute, DisputeMessagesModerator } from '../../../models/dispute.model';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ENV } from '../../../../environments/environment';

@Component({
  selector: 'app-dispute',
  templateUrl: './dispute.component.html',
  styleUrls: ['./dispute.component.scss']
})
export class DisputeComponent implements OnInit {
  
  dispute: Dispute;
  job: Job;
  ready: boolean = false;
  user: User;

  message: string = '';
  messageModerator: string = '';
  percentage_client: number = 0;
  percentage_freela: number = 0;
  value_client: number = 0;
  value_freela: number = 0;
  phaseDispute: string = '';

  apiUrl: string = ENV.API_URL;

  filesAttached: File[] = [];
  @ViewChild('attachFile') attachFile: ElementRef<HTMLElement>;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private disputeService: DisputeService,
    private toastrService: ToastrService,
    private userService: UserService,
    private router: Router,
    private uploadService: UploadService
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.route.params.subscribe(
      (params) => this.getDisputeDetails(params['disputeID'])
    )
  }


  getDisputeDetails(disputeId: number) {
    this.disputeService.getById(disputeId).subscribe(
      success => this.runSuccessGetDisputeInfos(success),
      error => console.error(error)
    )
  }

  getMessagesInfos() {
    for (const [index, item] of this.dispute.messages.entries()) {
      const id = typeof item.user === 'number' ? item.user : item.user.id;

      this.userService.getById(id).subscribe(
        success => {
          this.dispute.messages[index].user = success
        },
        error => console.error(error)
      );
    }

    for (const [index, item] of this.dispute.messages_moderator.entries()) {
      const id = typeof item.user === 'number' ? item.user : item.user.id;

      this.userService.getById(id).subscribe(
        success => {
          this.dispute.messages_moderator[index].user = success
        },
        error => console.error(error)
      );
    }

 
    this.ready = true;
  }

  sendMessage() {
    if (this.message === '') {
      this.runError('Digite sua mensagem', 'Ops! Algo deu errado');
      return;
    }

    this.disputeService.sendMessage({
      user: this.user,
      message: this.message,
      attachments: [],
      dispute: this.dispute
    }).subscribe(
      success => {
        this.runSuccess('Mensagem Enviada', 'Eba! Deu tudo certo');
        setTimeout(() => {
          location.reload();
        }, 5000)
      },
      error => {
        this.runError('Erro ao enviar mensagem', 'Ops! aLgo deu errado');
        console.error(error);
      }
    )
  }

  sendMessageToModerator() {
    
    if (this.filesAttached.length === 0 && this.messageModerator === '') {
      alert('Digite sua mensagem');
      return;
    }

    const msg = {
      message: this.messageModerator,
      type: this.user.type === 'Freelancer' ? 'with_freela' : 'with_client',
      moderator: null,
      user: this.user.id,
      attachments: [],
      dispute: this.dispute,
    }

    this.disputeService.sendMessageModerator(msg).subscribe(
      success => {
        if(this.filesAttached.length > 0) {
          this.uploadFiles(success);
        }
        
      },
      error => {
        console.error(['Erro ao enviar mensagem', error])
      }
    )

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

  uploadFiles(message: DisputeMessagesModerator) {
    const form = new FormData();

    this.filesAttached.forEach(file => {
      form.append('files', file);
    });
    form.append('ref', 'dispute_messages_moderators');
    form.append('filed', 'attachments');
    form.append('refId', `${message.id}`);

    this.uploadService.upload(form).subscribe(result => {
      console.log(result);
      message.attachments = result.map(r => r.id);

      this.disputeService.updateMessageModerator(message).subscribe(
        success => {
          console.log(success);
          location.reload();
        },
        error => {
          console.error(['Erro ao atualizar mensagem com o upload', error])   
        }
      )
    })
  }

  acceptProposal() {
    this.dispute.status = 'closed';
    this.dispute.job = this.job.id;
    this.job.status = JobStatusEnum.fechado_divisao;
    this.job.dispute = this.dispute.id;

    //Atualiza a disputa
    this.disputeService.update(this.dispute.id, this.dispute).subscribe(
      success => {
        //Atualiza o job
        this.jobService.update(this.job.id, this.job).subscribe(
          success => {
            //Atualiza ganhos e gastos das partes
            //Implementar Stripe
            this.job.freelancer.freelancer_earning += (this.job.agreed_value)*(this.dispute.percentage_freela/100);
            this.job.owner.client_spending += (this.job.agreed_value)*(this.dispute.percentage_owner/100);
            
            this.userService.update(this.job.freelancer).subscribe(
              success => {
                this.userService.update(this.job.owner).subscribe(
                  success => {
                    this.runSuccess('Acordo aceito! Os valores foram enviados de acordo.', 'Eba! Deu tudo certo');
                    setTimeout(() => {
                      this.router.navigateByUrl('dashboard');
                    }, 3000);
                  },
                  error => {
                    console.error(['Erro ao atualizar cliente', error]);
                  }   
                )
              }, 
              error => {
                console.error(['Erro ao atualizar freelancer', error]);
              }
            )
          }, 
          error => {
            this.runError('Erro ao aceitar o acordo', 'Ops! Algo deu errado');
            console.error(error);
          }
        )
        
      },
      error => {
        console.error(error);
      }
    );
  }

  recuseProposal() {

    this.dispute.percentage_owner = 0;
    this.dispute.percentage_freela = 0;
    this.dispute.deal_proposed_by = null;
    this.dispute.deal_proposal = 'none';
    this.dispute.job = this.job.id;

    this.disputeService.update(this.dispute.id, this.dispute).subscribe(
      success => {
        this.runSuccess('Acordo recusado! A disputa continua aberta.', 'Eba! Deu tudo certo');
      },
      error => {
        this.runError('Erro ao recusar o acordo', 'Ops! Algo deu errado');
        console.error(error);
      }
    )

  }

  calculateValueProposal() {
    if (this.percentage_client === 0 || this.percentage_freela === 0) {
      this.runError('Por favor, preencha as porcentagens', 'Ops! Algo deu errado');
      return;
    }

    if ((this.percentage_client + this.percentage_freela) > 100) {
      this.runError('Porcentagens incorretas', 'Ops! Algo deu errado');
      return;
    }

    this.value_client = this.job.agreed_value * (this.percentage_client / 100);
    this.value_freela = this.job.agreed_value * (this.percentage_freela / 100);
  }

  fillPerentageFreela() {
    
    if(this.percentage_client > 100) {
      this.runError('Porcentagem inválida! Informe um número de 0 a 100', 'Ops! Algo deu errado');
      return;
    }

    this.percentage_freela = 100 - this.percentage_client;
    this.calculateValueProposal();
  }

  sendProposal() {
    if (this.dispute.percentage_owner !== 0 || this.dispute.percentage_freela !== 0) {
      this.runError('Já existe um acordo proposto', 'Ops! Algo deu errado');
      return;
    }

    if (this.percentage_client + this.percentage_freela !== 100) {
      this.runError('Preencha corretamente os campos', 'Ops! Algo deu errado');
      return;
    }


    this.dispute.percentage_owner = this.percentage_client;
    this.dispute.percentage_freela = this.percentage_freela;
    this.dispute.deal_proposed_by = this.user;
    this.dispute.deal_proposal = 'made_by_parts';
    this.dispute.job = this.job.id;

    this.disputeService.update(this.dispute.id, this.dispute).subscribe(
      success => {
        this.runSuccess('Acordo Proposto com sucesso', 'Eba! Deu tudo certo');
        setTimeout(() => {
          location.reload();
        }, 5000)
      },
      error => {
        this.runError('Erro ao enviar acordo', 'Ops! Algo deu errado');
        console.error(error);
      }
    )
  }

  runSuccessGetDisputeInfos(response: Dispute) {
    this.dispute = response;
    
    this.phaseDispute = new Dispute(this.dispute).getPhase();

    let jobId = typeof this.dispute.job === 'number' ? this.dispute.job : this.dispute.job.id;
    
    this.jobService.getById(jobId).subscribe(
      success => {
        this.job = new Job(success);

        let frelaId = typeof this.job.freelancer === 'number' ? this.job.freelancer : this.job.freelancer.id;

        this.userService.getById(frelaId).subscribe(
          success => {
            this.job.freelancer = new User(success);

            let clientId = typeof this.job.owner === 'number' ? this.job.owner : this.job.owner.id;

            this.userService.getById(clientId).subscribe(
              success => {
                this.job.owner = new User(success);
                this.getMessagesInfos();
              },
              error => console.error('Erro ao recuperar dados de owner', error)
            );
          },
          error => console.error('Erro ao recuperar dados de freelancer', error)
        );
        
        
      },
      error => console.error(error)
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
