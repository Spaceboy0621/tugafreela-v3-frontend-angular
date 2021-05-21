import { ChatModel } from '../../../models/chat.model';
import { ChatService } from '../../../services/chat.service';
import { ToastrService } from 'ngx-toastr';
import { JobStatusEnum } from '../../../utils/enums/job-status.enum';
import { Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { User } from '../../../models/user.model';
import { ProposalService } from '../../../services/proposal.service';
import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'src/app/models/job.model';

@Component({
  selector: 'app-job-freela-card',
  templateUrl: './job-freela-card.component.html',
  styleUrls: ['./job-freela-card.component.scss']
})
export class JobFreelaCardComponent implements OnInit {
  
  @Input() job: Job;

  showActionsJob: boolean = false;
  user: User;
  deadlineLeft: number;
  statusColor: string;
  statusToShow: string;
  new_deadline: any;
  messagesJob: ChatModel[] = [];
  messagesNumber: number = 0;
  showMessageNotActions: boolean = false;
  proposalsNumber: number = 0;
  @Input() index: number;

  constructor(
    private proposalService: ProposalService,
    private jobService: JobService,
    private router: Router,
    private toastrService: ToastrService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if(this.showActionsJob && target.id !== `ul${this.index}` && target.id !== `div${this.index}` && target.id !== `svg${this.index}` && target.id !== `circle1${this.index}` && target.id !== `circle2${this.index}` && target.id !== `circle3${this.index}`) {
        this.showActionsJob = false;
      }
    });

    this.user = JSON.parse(localStorage.getItem('user'));

    const actualDate = new Date();
    const jobDeadline = new Date(this.job.deadline.toString());
    const diffTime = jobDeadline.getTime() - actualDate.getTime();

    this.deadlineLeft = (diffTime / 1000 / 3600);
    this.statusToShow = this.job.status.replace(/\_/g, ' ');
    
    this.getColorStatus();
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

  goToDetais(jobID) {
    this.router.navigateByUrl(`job/${jobID}`);
  }

  concludeJob() {
    this.job.status = JobStatusEnum.concluido_freela;
    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runSuccess('Job concluído com sucesso', 'Eba! DEu tudo certo');
        setTimeout(() => {
          this.router.navigateByUrl('dashboard');
        }, 5000)
      },
      error => {
        this.runError('Algo deu errado na conclusão desse job', 'Ops! algo deu errado');
        console.error(error);
      }
    );
  }
  
  closeJob() {
    const close = confirm('Tem certeza que deseja fechar esse job? O dinehiro voltará para o cliente e você não poderá avalia-lo');

    if (!close) {
      return;
    }

    this.job.status = JobStatusEnum.fechado_freela;

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runSuccess('Job fechado com sucesso', 'Eba! Deu tudo certo');
        setTimeout(() => {
          this.router.navigateByUrl('dashboard');
        }, 5000)
      },
      error => {
        this.runError('Algo deu errado no fechamento desse job', 'Ops! Algo deu errado');
        console.error(error);
      }
    )
  }

  newDeadLine() {
    this.job.new_deadline = this.new_deadline;
    this.job.status = JobStatusEnum.novo_prazo;

    this.jobService.update(this.job.id, this.job).subscribe(
      success => {
        this.runSuccess('Novo prazo solicitado com sucesso', 'Eba! Deu turod certo');
        setTimeout(() => {
          location.reload()
        }, 5000)
      },
      error => {
        this.runError('Erro ao solicitar novo prazo', 'Ops! Algo deu errado');
        console.error(['Erro ao solicitar novo prazo', error])
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
