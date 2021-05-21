import { NotificationService } from '../../../services/notification.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Proposal } from '../../../models/propsal.model';
import { ProposalService } from '../../../services/proposal.service';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User, Notification } from '../../../models/user.model';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-send-proposal',
  templateUrl: './send-proposal.component.html',
  styleUrls: ['./send-proposal.component.scss']
})
export class SendProposalComponent implements OnInit {

  ready: boolean = false;
  freelancer: User;
  jobDetails: Job; 
  proposalsFreela: Proposal[];

  proposalDescription: string = '';
  proposalTerm: number = null
  proposalValueTotal: number = 0;
  proposalServiceFare: number = 0;
  proposalValueGain: number = 0;

  hideShow: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private toastrService: ToastrService,
    private proposalService: ProposalService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.getJobInfos(params['jobID']);
    });
    
  }

  getJobInfos(jobId: number) {
    this.jobService.details(jobId).subscribe(
      (result) => {
        this.jobDetails = result;
        (this.jobDetails);
        this.laodFreelancerdata();

      },  
      (error) => {
        console.error(error);
      }
    );
  }

  laodFreelancerdata() {
    this.freelancer = JSON.parse(localStorage.getItem("user"));

    this.proposalService.listByFreela(this.freelancer).subscribe(
      success => {
        this.proposalsFreela = success;
        
        this.proposalsFreela.forEach((item) => {
          if(this.jobDetails.id === item.job.id) {
            this.runError('Você já enviou uma proposata para esse Job', 'Proposta já enviada');
            setTimeout(() => {
              this.router.navigateByUrl('search/job');
            }, 5000)
          }
        });
      },
      error => console.error(error)
    )
    this.ready = true;
  }
   
  sendProposal() {

    if (this.proposalDescription === '' || this.proposalValueTotal === 0 || this.proposalTerm === null) {
      this.runError('Por favor preencha todos os campos.', 'OPS! Algo deu errado.' );
      return;
    }

    
    let average_time = this.proposalTerm;


    average_time = Math.round((average_time/this.proposalTerm));
    

      const newProposal = {
         description: this.proposalDescription,
         freelancer: this.freelancer,
         value: this.proposalValueTotal,
         average_time: average_time,
         term: this.proposalTerm,
         job: this.jobDetails,
      }
    
    this.proposalService.create(new Proposal(newProposal)).subscribe(
      (result) => {
        this.runSuccess('Proposta Enviada', 'Boa! Deu tudo certo');
        this.notify();
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.runError('Ocorreu algum erro ao enviar a proposta', 'Ops! Algo deu errado');
        console.error(error);
      }
    )

   }

   notify() {
    const notify = new Notification({
      user: this.jobDetails.owner,
      job: this.jobDetails,
      text: `O freelancer '${this.freelancer.name}' fez uma proposta sobre o projeto '${this.jobDetails.title}'`,
      read: false,
      link: `job/${this.jobDetails.id}/list-proposals`
    });
    this.notificationService.notify(notify).subscribe(
      (result) => {
        console.log('[Envio de Proposta] Notificação enviada')
      },
      (error) => {
        console.error('[Envio de Proposta] Erro ao enviar notificação');
      }
    )
  }

  calculateValue() {
    this.proposalServiceFare = (this.proposalValueTotal * 0.15);
    this.proposalValueGain = (this.proposalValueTotal - this.proposalServiceFare);
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
