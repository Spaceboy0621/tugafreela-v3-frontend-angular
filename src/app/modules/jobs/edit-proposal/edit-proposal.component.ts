import { RunToastUtil } from './../../../utils/run-toast.util';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../services/notification.service';
import { Proposal } from '../../../models/propsal.model';
import { ProposalService } from '../../../services/proposal.service';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User, Notification } from '../../../models/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-proposal',
  templateUrl: './edit-proposal.component.html',
  styleUrls: ['./edit-proposal.component.scss']
})
export class EditProposalComponent implements OnInit {

  ready: boolean = false;
  freelancer: User;
  jobDetails: Job; 
  proposalDescription: string = '';
  proposalTerm: number = 0;
  proposalValueTotal: number = 0;
  proposalServiceFare: number = 0;
  proposalValueGain: number = 0;
  proposalActual: Proposal;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private toastrService: ToastrService,
    private proposalService: ProposalService,
    private notificationService: NotificationService,
    private runToastUtil: RunToastUtil,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.getProposalInfos(params['proposalID']);

    });
    
  }

  getJobInfos(jobId: number) {
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

  getProposalInfos(proposalId: number) {
    this.proposalService.getByID(proposalId).subscribe(
      (result) => {
        this.proposalDescription = result.description;
        this.proposalTerm = result.term;
        this.proposalValueTotal = result.value;
        this.proposalActual = result;
        this.calculateValue();
        this.getJobInfos(result.job.id);
      },
      (error) => {
        console.error(error);
      }
    )
  }
   
  editProposal() {

    if (this.proposalDescription === '' || this.proposalValueTotal === 0 || this.proposalTerm === null) {
      this.toastrService.error('')
      return;
    }

    let average_time = this.proposalTerm;

    average_time = Math.round((average_time/this.proposalTerm));
    

      const newProposal = {
         id: this.proposalActual.id,
         description: this.proposalDescription,
         freelancer: this.freelancer,
         value: this.proposalValueTotal,
         average_time: average_time,
         term: this.proposalTerm,
         job: this.jobDetails,
      }
    
    this.proposalService.update(new Proposal(newProposal)).subscribe(
      (result) => {

        this.notificationService.notify(new Notification({
          job: this.jobDetails,
          user: this.jobDetails.owner.id,
          text: `O freelancer '${this.freelancer.name}' editou sua proposta sobre o projeto '${this.jobDetails.title}'`,
          read: false,
          link: `job/${this.jobDetails.id}/list-proposals`
        })).subscribe(
          success => console.log(success),
          error => console.error(error)
        )

        this.runToastUtil.success(2000, 'Proposta editada com sucesso');
        setTimeout(() => {
          this.router.navigateByUrl('dashboard');
        }, 2000);
      },
      (error) => {
        console.error(error);
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

