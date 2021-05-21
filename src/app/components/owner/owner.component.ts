import { ActivatedRoute } from '@angular/router';
import { JobService } from './../../services/job.service';
import { UserService } from './../../services/user.service';
import { Proposal } from './../../models/propsal.model';
import { Job } from './../../models/job.model';
import { User } from './../../models/user.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
export class OwnerComponent implements OnInit {

  ready: boolean = false;
  owner: User;
  jobDetails: Job;
  proposals: Proposal[];
  averageValue: number = 0;
  averageTime: number = 0;
  averageOwnerRating: number[] = [];
  concludedProjects = [];
  closed: boolean = false;
  userLogged: User;
  @Input() jobID?: number;

  @Input() details: boolean = false;
  showItems: boolean = false;
  path: string;

  constructor(
    private userService: UserService,
    private jobService: JobService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userLogged = JSON.parse(localStorage.getItem('user'));
    let text = location.pathname.split('/');
    this.path = text[text.length - 1];
    if (!closed && this.userLogged.type === 'Freelancer'){
      this.showItems = true;   
    }

    
    this.route.params.subscribe((params) => {
      if (params['jobID']) {
        this.getJobInfos(params['jobID']);
      }
      else {
        this.getJobInfos(this.jobID);
      }
    });
  }

  getJobInfos(jobId: number) {
    this.jobService.details(jobId).subscribe(
      (result) => {
        this.runSuccessJobs(result);
      },  
      (error) => {
        console.error(error);
      }
    );
  }

  getOwnerInfos() {
    this.userService.getById(this.jobDetails.owner.id).subscribe(
      (result) => {
          this.runSuccessOwner(result);
      },
      (error) => {
        console.error(error);
      }
    )
  }

  getJobsConcluded() {
    this.jobService.myJobs(this.jobDetails.owner).subscribe(
      success => {
        this.concludedProjects = success.filter(item => item.status === 'concluido')
        this.ready = true;
      },
      error => console.error(error)
      
    )
    
    this.ready = true;
  }

  runSuccessJobs(result) {
    this.jobDetails = new Job(result);
    this.closed = this.jobDetails.status !== 'ativo' ? true : false;
    
    this.proposals = this.jobDetails.proposals;
   
    if (this.proposals.length > 0) {
      this.proposals.forEach((item) => {   
        this.averageValue += item.value;
        this.averageTime += item.average_time;
     });
     
     this.averageValue = (this.averageValue / this.proposals.length);
     this.averageTime = Math.round((this.averageTime / this.proposals.length));
    }
    

    this.getOwnerInfos();
 }

 runSuccessOwner(result) {
    let rating = 0;
    this.owner = new User(result);
    
    rating = this.owner.getMediaRating();

    for (let i = 0; i < rating; i++) {
      this.averageOwnerRating.push(i);
    }
    this.getJobsConcluded();
 }

}
