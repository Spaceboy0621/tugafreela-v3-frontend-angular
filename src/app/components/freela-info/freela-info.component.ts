import { UserService } from './../../services/user.service';
import { JobService } from './../../services/job.service';
import { Proposal } from './../../models/propsal.model';
import { Job } from './../../models/job.model';
import { User } from './../../models/user.model';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-freela-info',
  templateUrl: './freela-info.component.html',
  styleUrls: ['./freela-info.component.scss']
})
export class FreelaInfoComponent implements OnInit {

  ready: boolean = false;
  freela: User;
  @Input() jobDetails: Job;
  proposals: Proposal[];
  averageValue: number = 0;
  averageTime: number = 0;
  averageFreelaRating: number[] = [];
  concludedProjects = [];
  closed: boolean = false;
  userLogged: User;

  constructor(
    private jobService: JobService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getFreelaInfos();
  }

  getFreelaInfos() {
    const id = typeof this.jobDetails.freelancer === 'number' ? this.jobDetails.freelancer : this.jobDetails.freelancer.id; 
    this.userService.getById(id).subscribe(
      (result) => {
          this.runSuccessFreela(result);
      },
      (error) => {
        console.error(error);
      }
    )
  }

  getJobsConcluded() {
    this.jobService.myJobs(this.jobDetails.freelancer).subscribe(
      success => {
        this.concludedProjects = success.filter(item => item.status === 'concluido')
        this.ready = true;
      },
      error => console.error(error)
      
    )
    
    
    this.ready = true;
  }

  runSuccessJobs(result) {
    this.jobDetails = result;
    this.closed = this.jobDetails.status !== 'aberto' ? true : false;
    
    this.proposals = this.jobDetails.proposals;
   
    if (this.proposals.length > 0) {
      this.proposals.forEach((item) => {   
        this.averageValue += item.value;
        this.averageTime += item.average_time;
     });
     
     this.averageValue = (this.averageValue / this.proposals.length);
     this.averageTime = Math.round((this.averageTime / this.proposals.length));
    }
    

 }

 runSuccessFreela(result) {
   this.jobDetails.freelancer = result;
    let rating = 0;
    this.freela = new User(result);
    
    rating = this.freela.getMediaRating();

    for (let i = 0; i < rating; i++) {
      this.averageFreelaRating.push(i);
    }
    this.getJobsConcluded();
 }

}
