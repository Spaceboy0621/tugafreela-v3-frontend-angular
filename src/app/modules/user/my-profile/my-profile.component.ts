import { RunToastUtil } from './../../../utils/run-toast.util';
import { LevelRulesService } from '../../../services/level-rules.service';
import { UploadService } from '../../../services/upload.service';
import { Job } from '../../../models/job.model';
import { JobService } from '../../../services/job.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Rating, User } from '../../../models/user.model';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  feedbacks: Array<Rating>;
  user: User;
  userLogged: User;
  ready: boolean = false;
  jobsConcluded: Job[];
  jobsActive: Job[];
  mediaRating: number = 0;

  actualLevelNumber: number = 0;
  minValueLevel: number = 0;
  maxValueLevel: number = 0;
  levelLabel: string = '';
  actualLevel: string = '';
  deleteAccountModal: boolean = false;

  constructor(
    private userService: UserService,
    private jobService: JobService,
    private router: Router,
    private fb: FormBuilder,
    private uploadService: UploadService,
    private levelRulesService: LevelRulesService,
    private runToastUtil: RunToastUtil,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userLogged = new User(JSON.parse(localStorage.getItem("user")));

    this.route.params.subscribe(
      params => {
        if (params['userID']) {
          this.userService.getById(params['userID']).subscribe(
            success => {
              this.user = new User(success);
              this.getInfos()
            }
          )
        }
        else {
          this.user = this.userLogged;
          this.getInfos()
        }
      }
    );
   

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if (
        this.deleteAccountModal
        && !target.classList.contains('modal-confirm') 
        && !target.classList.contains('title') 
        && !target.classList.contains('text')
        && !target.classList.contains('btn-cancel')
        && !target.classList.contains('default')
      ) {
        this.deleteAccountModal = false;
      }
    });
    
  }

  getInfos() {
    if (this.userLogged.id !== this.user.id) {
      this.userService.addNewView(this.user).subscribe(
        success => {},
        error => {}
      );
    }

    let id;

    if (typeof this.user.photo === 'number') id = this.user.photo;

    if(typeof this.user.photo !== 'number') id = this.user.photo.id;

    this.uploadService.getById(id).subscribe(
      success => {
        this.user.photo = success;
      },
      error => console.error(error)
    );

    this.getFeedbacks();
  }

  verifyPayment() {
    if (this.user.payment_verified) {
      return;
    }

    this.router.navigateByUrl('my-financial');
  }

  getFeedbacks() {
    this.userService.getFeedbacks(this.user).subscribe(
      success => {
        this.feedbacks = success;
        console.log(this.feedbacks);
        this.feedbacks.forEach((item, index) => {7
          this.feedbacks[index].valuer = new User(item.valuer);
          this.userService.getById(item.user.id).subscribe(
            success => {
              this.feedbacks[index]['averageRating'] = new Array<number>(this.feedbacks[index].rating);
              this.feedbacks[index].user = success;
              this.feedbacks[index].user['averageRating'] = new Array<number>(new User(success).getMediaRating())
              this.mediaRating += new User(success).getMediaRating();
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
        this.mediaRating = this.mediaRating / this.feedbacks.length;
        this.getLevel();
        this.ready = true;
      },
      error => console.error(error)
    )
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl("/");
    scrollTo(0,0);
  }

  deleteAccount(event) {
    
    if (!event) {
      this.deleteAccountModal = false;
      return;
    }
    
    this.user.accountStatus = 'inactive';

    this.userService.update(this.user).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Conta deletada com sucesso');
        setTimeout(() => {
          this.logout();
        }, 2000);
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao deletar sua conta');
      }
    )
  }

  getLevel() {
    
    const level = this.user.level;
    this.actualLevelNumber = this.user.level;

    const type = this.user.type === 'Freelancer' ? 'freelancer' : 'cliente';
    this.levelRulesService.getRulesByType(type).subscribe(
      success => {
       
        for (const [index, item] of success.entries()) {
          
          if (level >= item.pts_min && level <= item.pts_max) {
            
            this.minValueLevel = item.pts_min;
            this.maxValueLevel = item.pts_max;
            this.levelLabel = item.label;
            
          }
        }

        this.actualLevel = ((100 * level) / this.maxValueLevel) + '%';


      }, 
      error => {
        console.error(['Erro ao recuperar dados do nível', error])
      }
    );


  }


}
