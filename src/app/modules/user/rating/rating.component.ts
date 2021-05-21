import { DisputeService } from '../../../services/dispute.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { User, Rating, Notification } from '../../../models/user.model';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {

  job: Job;
  currentRate: number;
  ratingText: string = '';
  ready: boolean = false; 
  user: User;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private userService: UserService,
    private notificationService: NotificationService,
    private ratingConfig: NgbRatingConfig,
    private toastrService: ToastrService,
    private disputeService: DisputeService
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user')); 
    this.configRating();

    this.route.params.subscribe(
      (params) => this.getJobInfos(params['jobID'])
    )
  }

  rate() {
    if(this.currentRate === null || this.currentRate === 0 || this.ratingText === '') {
      alert('Preencha os campos corretamente');
      return;
    }
    const rated = this.user.type === 'Freelancer' ? this.job.owner : this.job.freelancer;

    const rate = new Rating({
      rating: this.currentRate,
      user: rated,
      valuer: this.user,
      comment: this.ratingText,
      job: this.job
    });

    const notification = new Notification({
      job: this.job,
      user: rated,
      text: `${this.user.name} acaba de te avaliar referente ao projeto ${this.job.title}. Entre e veja!`,
      read: false,
      link: `me/profile`
    });

    this.user.type === 'Freelancer' ? this.job.freela_rated = true : this.job.client_rated = true;
    

    this.userService.rateUser(rate).subscribe(
      (success) => {
        this.notificationService.notify(notification).subscribe(
          success => {
          },
          error => console.error(error)
        );

        this.updateJob();
        this.runSuccess('Avaliação enviada', 'Eba! Deu tudo certo');
        setTimeout(() => {
          this.router.navigate(['/dashboard'])
        }, 3000)
          
      }, 
      error => console.error(error)
    )

  }

  updateJob() {
    if (this.job.dispute) {
      let disputeId = typeof this.job.dispute === 'number' ? this.job.dispute : this.job.dispute.id;

      this.job.dispute = disputeId;
    }
    

    this.jobService.update(this.job.id, this.job).subscribe(
      success =>  console.log(['Job atualizado', success]),
      error => console.error(error)
    );
  }


  configRating(){
    this.ratingConfig.max = 5;
    this.ratingConfig.resettable = true;
  }

  getJobInfos(jobId) {
    this.jobService.getById(jobId).subscribe(
      (success) => {
        this.job = success;

        let freelaId = typeof this.job.freelancer === 'number' ? this.job.freelancer : this.job.freelancer.id;
        let clientId = typeof this.job.owner === 'number' ? this.job.owner : this.job.owner.id;;

        this.userService.getById(freelaId).subscribe(
          success => {
            this.job.freelancer = new User(success);
          },
          error => {
            console.error(['Erro ao recuperar dados do freelancer', error])
          }
        );

        this.userService.getById(clientId).subscribe(
          success => {
            this.job.owner = new User(success);
          },
          error => {
            console.error(['Erro ao recuperar dados do cliente', error])
          }
        );


        if (this.job.client_rated && this.user.type === 'Cliente') {
          this.runError('Ops! Algo deu errado', 'Você já avaliou o freelancer em relação a esse projeto');
          setTimeout(() => {
            this.router.navigateByUrl('dashboard');
          }, 2000);
          return;
        }

        if (this.job.freela_rated && this.user.type === 'Freelancer') {
          this.runError('Ops! Algo deu errado', 'Você já avaliou o cliente em relação a esse projeto');
          setTimeout(() => {
            this.router.navigateByUrl('dashboard');
          }, 2000);
          return;
        }
        
        this.ready = true;
      },
      error => console.error(error)
    )
  }

  runError(message: string, title: string) {
    this.toastrService.error(message, title, {
      progressBar: true,
      timeOut: 2000
    });
  }

  runSuccess(message: string, title: string) {
    this.toastrService.success(message, title, {
      progressBar: true,
      timeOut: 2000
    });
  }

}
