import { ActivatedRoute } from '@angular/router';
import { Job } from '../../models/job.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  job: Job;

  constructor(
    
  ) { }

  ngOnInit(): void {
  }

}
