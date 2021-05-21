import { Router } from '@angular/router';
import { LevelRulesService } from '../../../services/level-rules.service';
import { UploadService } from '../../../services/upload.service';
import { Proposal } from '../../../models/propsal.model';
import { UserService } from '../../../services/user.service';
import { ProposalService } from '../../../services/proposal.service';
import { Component, OnInit } from '@angular/core';
import { Job } from '../../../models/job.model';
import { User } from '../../../models/user.model';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit  {
  user: User;
  showActionsJob: boolean = false;
  listJobs: Job[];
  proposals: Proposal[];
  ready: boolean = false;
  minValueLevel: number = 0;
  maxValueLevel: number = 35;
  actualLevel: string = '0%';
  actualLevelNumber: number = 30;
  levelLabel: string = '';
  proposalsFreelaAccepted: Proposal[];
  jobsOnDoingClient: Job[];
  jobsConcludedClient: Job[];
  jobsAtivos: Job[];
  buyLevelModal: boolean = false;
  
  constructor(
    private uploadService: UploadService,
    private jobService: JobService,
    private proposalService: ProposalService,
    private userService: UserService,
    private levelRulesService: LevelRulesService,
    private router: Router
  ) { }

  ngOnInit(): void {

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if (this.buyLevelModal && target.classList.contains('bg')) {
        this.buyLevelModal = false;
      }
    });

    let id;
    this.user = new User(JSON.parse(localStorage.getItem("user")));

    this.user.freelancer_earning = this.user.freelancer_earning === null ? 0 : this.user.freelancer_earning;
    this.user.client_spending = this.user.client_spending === null ? 0 : this.user.client_spending;
    this.user.views = this.user.views === null ? 0 : this.user.views;

    if (typeof this.user.photo === 'number') id = this.user.photo;

    if (typeof this.user.photo[0] === 'number') id = this.user.photo[0];

    if(typeof this.user.photo !== 'number') id = this.user.photo.id;

    this.getLevel();
    this.getEarningsAndSpendings();

    this.uploadService.getById(id).subscribe(
      success => {
        this.user.photo = success;
      },
      error => console.error(error)
    );

    this.jobService.myJobs(this.user).subscribe(
      (result) => {
        this.listJobs = result;
        this.jobsOnDoingClient = this.listJobs.filter(item => item.status === 'em_andamento')
        this.jobsConcludedClient = this.listJobs.filter(item => item.status === 'concluido')

        this.jobsAtivos = this.listJobs.filter(item => item.status === 'ativo');
        
        if(!this.user.isFreela()) {
          this.ready = true;
        }
      }, 
      (error) => {
        console.error(error);
    });

    if(this.user.isFreela()) {
      this.getProposals();
    }
    
  }

  getProposals() {
    this.proposalService.listByFreela(this.user).subscribe(
      (result) => {

        result.forEach((item, index) => {
          if (typeof item.job.owner === 'number') {
            this.userService.getById(Number(item.job.owner)).subscribe(
              (res) => result[index].job.owner = res,
              (error) => console.error(error)
            );
          }
          
        });

        this.proposals = result;
        this.proposalsFreelaAccepted = this.proposals.filter(item => item.status === 'Aceita')
        this.ready = true;
      },
      (error) => {
        console.error(error);
      }
    );
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

        console.log(this.maxValueLevel);
      }, 
      error => {
        console.error(['Erro ao recuperar dados do nível', error])
      }
    );


  }

  showBuyLevelModal() {
    this.buyLevelModal = true;
    scrollTo(0,0);
  }

  buyPlan() {
    const item = 'Plano Premium Pacote Mensal';
    const price = 15;
    const type = 'premium';
    this.router.navigateByUrl(`/checkout/${item}/${price}/${type}`);

  }

  getEarningsAndSpendings() {
    this.userService.getById(this.user.id).subscribe(
      success => {
        this.user.freelancer_earning = success.freelancer_earning === null ? 0 : success.freelancer_earning ;
        this.user.client_spending = success.client_spending === null ? 0 : success.client_spending;
        this.user.views = success.views === null ? 0 : success.views;        
        this.user.level = success.level;
        this.user.ratings = success.ratings;

      },
      error => {
        console.error(['Erro ao recuperar dados financeiros', error])
      }
    )
  }

}
