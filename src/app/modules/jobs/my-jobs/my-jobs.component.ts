import { ActivatedRoute } from '@angular/router';
import { Proposal } from '../../../models/propsal.model';
import { UserService } from '../../../services/user.service';
import { ProposalService } from '../../../services/proposal.service';
import { Component, Input, OnInit } from '@angular/core';
import { Job } from '../../../models/job.model';
import { User } from '../../../models/user.model';
import { JobService } from '../../../services/job.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.component.html',
  styleUrls: ['./my-jobs.component.scss']
})
export class MyJobsComponent implements OnInit {
  status: string = 'all';

  filters = {
    status: "",
    client: "",
    job: ""
  }

  user: User;
  showActionsJob: boolean = false;
  listJobs: Job[];
  proposals: Proposal[];
  ready: boolean = false;
  jobsAtivos: number = 0;

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.user = new User(JSON.parse(localStorage.getItem("user")));
    this.route.params.subscribe(
      params => {
        if (params['status']) {
          this.status = params['status'];
        }
      }
    );
    this.listAllJobs();
    
  }

  listAllJobs() {
    this.jobService.myJobs(this.user).subscribe(
      (result) => {
        this.listJobs = result;
        if (this.status === 'all') {
          this.listJobs = this.listJobs.filter(item => (item.status !== 'ativo' && item.status !== 'em_andamento' && item.status !== 'em_disputa'));
        }
        if (this.status === 'on_going') {
          this.listJobs = this.listJobs.filter(item => (item.status === 'em_andamento' || item.status === 'ativo' || item.status === 'em_disputa'));
        }
        this.jobsAtivos = this.listJobs.length;
        this.ready = true;
      }, 
      (error) => {
        console.log(error);
    });

  }

  filterJobs(type: string) {

    if(type === 'all') {
      this.listAllJobs();

    }

    if (type === 'status') {
      this.listJobs = this.listJobs.filter(item => item.status === this.filters.status);
    }

    if (type === 'client') {

      if(this.filters.client.length >= 5) { 
        this.listJobs = this.listJobs.filter(item => item.owner.name.match(this.filters.client));
      }
      
    }

    if (status === 'job') {      
      this.listJobs = this.listJobs.filter(item => item.title.match(this.filters.job));
    }
  }


}
