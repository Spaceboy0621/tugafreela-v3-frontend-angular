import { Job } from 'src/app/models/job.model';
import { JobService } from './../../services/job.service';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-new-deadline',
  templateUrl: './modal-new-deadline.component.html',
  styleUrls: ['./modal-new-deadline.component.scss']
})
export class ModalNewDeadlineComponent implements OnInit {

  @Input() title: string = '';
  @Input() type: string = '';

  @Output() sendNewDeadlineEvent = new EventEmitter();
  @Output() acceptOrRejectEvent = new EventEmitter();

  actual_deadline: number = null;
  new_deadline: number = null;
  
  expires_deadline: Date;
  expires_newDeadline: Date;

  newDeadlineInvalid: boolean = false;

  job: Job;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe(
      params => {
        this.jobService.getById(params['jobID']).subscribe(
          success => {
            this.job = new Job(success);
            this.getInfos();
          },
          error => {
            console.error(['Erro ao recuperar dados do job', error])
          }
        )
      }
    );
  }
  
  getInfos() {
    this.actual_deadline = this.job.getTimeProjectDays();
    const one_day = 1000 * 60 * 60 * 24;
    
    const expires = (new Date().getTime() + (this.actual_deadline * one_day));
    
    this.expires_deadline = new Date(expires);

    if (this.type === 'response') {
      const daysNewDeadline = new Date(this.job.new_deadline).getTime() - new Date(this.job.created_at).getTime();
      
      this.new_deadline = Math.round(daysNewDeadline / one_day);

      const expires2 = (new Date().getTime() + (this.new_deadline * one_day));
      this.expires_newDeadline = new Date(expires2);
    }
  }

  calcuateExpires() {
    if(this.new_deadline <= this.actual_deadline) {
      this.newDeadlineInvalid = true;
    }
    if(this.new_deadline > this.actual_deadline) {
      this.newDeadlineInvalid = false;
    }

    const one_day = 1000 * 60 * 60 * 24;

    const expires2 = (new Date().getTime() + (this.new_deadline * one_day));
    this.expires_newDeadline = new Date(expires2);
  }

  send(acceptOrRecuse: string) {
    const one_day = 1000 * 60 * 60 * 24;

    if (this.type === 'request') {
      if (acceptOrRecuse === 'recuse') {
        this.sendNewDeadlineEvent.emit('close');
        return;
      }

      const new_deadline =  (new Date().getTime() + (this.new_deadline * one_day));
      this.sendNewDeadlineEvent.emit({
        type: 'request',
        actual_deadline: this.actual_deadline, 
        new_deadline
      });
    }

    if (this.type === 'response') {
      this.acceptOrRejectEvent.emit(acceptOrRecuse);
    }
    
  }

}
