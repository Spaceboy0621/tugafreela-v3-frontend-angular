import { ChatModel } from '../../../models/chat.model';
import { ChatService } from '../../../services/chat.service';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';
import { JobStatusEnum } from '../../../utils/enums/job-status.enum';
import { ProposalService } from '../../../services/proposal.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-job-card-proposal',
  templateUrl: './job-card-proposal.component.html',
  styleUrls: ['./job-card-proposal.component.scss']
})
export class JobCardProposalComponent implements OnInit {

  @Input() title: string = '';
  @Input() client: string = '';
  @Input() status: string = '';
  @Input() proposalId: number = 0;
  @Input() jobId: number;
  job: Job;
  ready: boolean = false;

  showActionsJob: boolean = false;
  statusColor: string;
  statusToShow: string;

  messagesJob: ChatModel[] = [];
  messagesNumber: number = 0;
  
  proposalsNumber: number = 0;

  @Input() index: number;
  showMessageNotActions: boolean = false;
  
  constructor(
    private router: Router,
    private proposalService: ProposalService, 
    private jobService: JobService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    //Close actions on click out
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if(this.showActionsJob && target.id !== `ul${this.index}` && target.id !== `div${this.index}` && target.id !== `svg${this.index}` && target.id !== `circle1${this.index}` && target.id !== `circle2${this.index}` && target.id !== `circle3${this.index}`) {
        this.showActionsJob = false;
      }
    });

    this.statusToShow = this.status.replace(/\_/g, ' ');
    this.getColorStatus();

  }

  getColorStatus() {
    if (this.status === JobStatusEnum.ativo) this.statusColor = 'green';
    if (this.status === JobStatusEnum.pagamento) this.statusColor = 'yellow';
    if (this.status === JobStatusEnum.andamento) this.statusColor = 'green';
    if (this.status === JobStatusEnum.novo_prazo) this.statusColor = 'orange';
    if (this.status === JobStatusEnum.concluido_freela) this.statusColor = 'yellow';
    if (this.status === JobStatusEnum.concluido) this.statusColor = 'blue';
    if (this.status === JobStatusEnum.fechado_cliente) this.statusColor = 'red';
    if (this.status === JobStatusEnum.fechado_freela) this.statusColor = 'red';
    if (this.status === JobStatusEnum.cancelado) this.statusColor = 'black';
    if (this.status === JobStatusEnum.disputa) this.statusColor = 'orange';
    if (this.status === JobStatusEnum.fechado_para_cliente) this.statusColor = 'brown';
    if (this.status === JobStatusEnum.fechado_para_freela) this.statusColor = 'brown';
    if (this.status === JobStatusEnum.fechado_divisao) this.statusColor = 'brown';

    this.jobService.getById(this.jobId).subscribe(
      success => {
        this.job = new Job(success);

        this.ready = true;
      },
      error => {
        console.error(['Erro ao recuperar dados do job', error])
      }
    );

    this.getMessages();
    this.getProposals();
    
  }

  getMessages() {
    this.chatService.getByJob(this.jobId).subscribe(
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

  openActionsJob(){
    const ulChildren = document.getElementById(`ul${this.index}`);

    if (ulChildren.children.length <= 1) {
      this.showMessageNotActions = true;
    }
    else {
      this.showMessageNotActions = false;
    }

    this.showActionsJob = !this.showActionsJob;
  }

  editProposal() {

    this.router.navigateByUrl(`job/${this.proposalId}/${this.jobId}/edit-proposal`);
  }

  cancelProposal(){
   const conf = confirm('Deseja mesmo deletar a proposta?');

   if (conf) {
    this.proposalService.delete(this.proposalId).subscribe(
      success => alert('Proposta Cancelada'),
      error => console.error(error)
    );
   }
    
  }

  goToDetais(jobID) {
    this.router.navigateByUrl(`job/${jobID}`);
  }

}
