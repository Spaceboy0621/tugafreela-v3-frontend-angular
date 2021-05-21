import { JobService } from '../../../services/job.service';
import { UserService } from '../../../services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(
    private userService: UserService,
    private JobService: JobService
  ) { }

  quantityFreelancers: number = 0;
  quantityProjects: number = 1;
  quantityOnlineUsers: number = 1;

  ngOnInit(): void {
    console.log({
      appVersion: '14.04.2021-3'
    });
    
    this.userService.getAll().subscribe(
      success => this.quantityFreelancers = (success.filter(item => item.type === 'Freelancer')).length,
      error => console.error(error)
    )
  }

}
