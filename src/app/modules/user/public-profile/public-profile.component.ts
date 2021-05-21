import { ToastrService } from 'ngx-toastr';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Rating, User } from '../../../models/user.model';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  feedbacks: Array<Rating>;
  user: User;
  ready: boolean = false;
  jobsConcluded: Job[];
  jobsActive: Job[];
 

  constructor(
    private userService: UserService,
    private jobService: JobService,
    private toastrService: ToastrService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getUser(params['userID'])
    );
  }

  getUser(id: number) {
    this.userService.getById(id).subscribe(
      success => {
        this.user = new User(success);
        
        this.getFeedbacks();
      },
      error => {
        this.runError('Erro ao carregar perfil', 'Ops! Algo deu errado');
        console.error(error);
      }
    )
  }

  getFeedbacks() {
    this.userService.getFeedbacks(this.user).subscribe(
      success => {
        this.feedbacks = success;

        this.feedbacks.forEach((item, index) => {
          this.userService.getById(item.user.id).subscribe(
            success => {
              this.feedbacks[index]['averageRating'] = new Array<number>(this.feedbacks[index].rating);
              this.feedbacks[index].user = success;
              this.feedbacks[index].user['averageRating'] = new Array<number>(new User(success).getMediaRating())
            },
            error => console.error(error)
          );

        });
        this.getMyJobs();
      },
      error => console.error(error)
    );
    

  }

  getMyJobs() {
    this.jobService.myJobs(this.user).subscribe(
      success => {
        this.jobsConcluded = success.filter(item => item.status === 'Concluido');
        this.jobsActive = success.filter(item => item.status === 'Ativo');

        this.ready = true;
      },
      error => console.error(error)
    )
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
