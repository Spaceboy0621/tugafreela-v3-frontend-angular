import { User } from '../../../models/user.model';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { Proposal } from '../../../models/propsal.model';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Notification } from 'src/app/models/user.model';

@Component({
  selector: 'app-list-proposals',
  templateUrl: './list-proposals.component.html',
  styleUrls: ['./list-proposals.component.scss']
})
export class ListProposalsComponent implements OnInit {

  job: Job;
  showActionsJob: boolean = false;
  proposals: Proposal[];
  ready: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private userService: UserService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params) => this.getJobInfos(params['jobID'])
    )
  }

  getJobInfos(jobId: number) {
    this.jobService.getById(jobId).subscribe(
      success => {
        this.job = success;
        this.getProposals();
      },
      error => console.error(error)
    )
  }

  getProposals() {
    this.proposals = this.job.proposals;

    this.proposals.forEach((item, index) => {
      if (typeof item.freelancer === 'number') {
        this.userService.getById(Number(item.freelancer)).subscribe(
          success => {
            item.freelancer = success;
            this.proposals[index].freelancer = success;
            this.proposals[index].freelancer['averageRating'] = new Array<number>(new User(item.freelancer).getMediaRating());
          },
          error => console.error(error)
        );
      }
    });

    this.ready = true;
    
  }

  openActionsJob() {
    this.showActionsJob = !this.showActionsJob;
  }

}
