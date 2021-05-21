import { RunToastUtil } from './../../../utils/run-toast.util';
import { ProposalService } from './../../../services/proposal.service';
import { ProjectViewsModel } from './../../../models/project-views.model';
import { filter } from 'rxjs/operators';
import { LevelRulesService } from './../../../services/level-rules.service';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from '../../../models/job.model';
import { User } from '../../../models/user.model';
import { JobService } from '../../../services/job.service';
import { DateUtilsService } from '../../../services/date-utils.service';

interface Parameter {
  name: string;
  value: number;
}

@Component({
  selector: 'app-search-job',
  templateUrl: './search-job.component.html',
  styleUrls: ['./search-job.component.scss']
})
export class SearchJobComponent implements OnInit {
  clearCategories: EventEmitter<boolean> = new EventEmitter();
  
  listJobs: Job[];
  listJobsBckp: Job[];
  categoriesFilter: number[];
  user: User;
  ready: boolean = false;
  rankActual: string = '';
  levelActual: string = '';
  freelaLevel = {
    pts_min: 0,
    pts_max: 0
  }
  jobsViews: ProjectViewsModel[];
  checkFeatured: boolean = false;
  checkUrgent: boolean = false;

  constructor(
    public dateUtilsService: DateUtilsService,
    private jobService: JobService,
    private router: Router,
    private levelRuleService: LevelRulesService,
    private proposalService: ProposalService,
    private toastService: RunToastUtil
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.user = new User(this.user);
    this.getFreelaLevel();
  }

  filterByCategories(listaCategories) {
    this.categoriesFilter = listaCategories.map(c => c.id);
    this.filter();
  }  

  filterByRanking(value: number) {
    this.listJobs = this.listJobs.filter(item => item.owner.getMediaRating() <= value);
  }


  filterByLevel(min: number, max: number) {
    this.listJobs = this.listJobs.filter(item => (item.owner.level >= min && item.owner.level <= max));
  }

  filterByType(value: string) {
    this.listJobs = this.listJobs.filter(item => item[value] === true);
  }

  resetFilters() {
    this.rankActual = '';
    this.levelActual = '';
    this.checkFeatured = false;
    this.checkUrgent = false;
    this.clearCategories.emit(true);
    const elRanking  = document.getElementsByClassName('filter-ranking-sel')[0];
    const elLevel = document.getElementsByClassName('filter-level-sel')[0];
    elRanking.classList.remove('filter-ranking-sel');
    elRanking.classList.add('filter-ranking-unsel');

    elLevel.classList.remove('filter-level-sel');
    elLevel.classList.add('filter-level-unsel');

    this.filter();
  }

  private filter(parameter?: Parameter) {
    let jobsTemp: Job[];
    let hasSkill: boolean = false;

    this.jobService.search({ categories: this.categoriesFilter }).subscribe(
      result => {

        // New user instance to owner
        this.listJobs = result.map(r => {
          r.owner = new User(r.owner);
          return r;
        });

        //Filter By status and freela level
        this.listJobs = this.listJobs.filter(item =>  (item.status === 'ativo' && item.level_experience <= this.freelaLevel.pts_max) );
        
        
        jobsTemp = this.listJobs;
        this.listJobs = [];

        //Filter by freela skill
        jobsTemp.forEach((job) => {
          job.skills.forEach((skillJob) => {
            if(!hasSkill) {
              this.user.skills.forEach((skillUser) => {
                if(!hasSkill) {
                  if (skillJob.name === skillUser.name) {
                    hasSkill = true;
                    this.listJobs.push(job);
                  }
                }
                
              });
            }
            hasSkill = false;
          });
        });

        if (parameter && parameter.name === 'ranking') {
          //Filter by ranking
          this.filterByRanking(parameter.value);
        }
        if (parameter && parameter.name === 'level') {
          //Filter by level
          let min: number;
          let max: number = parameter.value;

          if (max === 70) min = 0;
          if (max === 150) min = 71;
          if (max === 200) min = 151;
          if (max === 2000) min = 200;

          this.filterByLevel(min, max);
        }
        if (parameter && parameter.name === 'type') {
          //Filter by project type
          let type = parameter.value === 1 ? 'featured' : 'urgent';
          this.filterByType(type);
        }
        this.listJobsBckp = this.listJobs;
        this.getJobsViewws();

      }, 
      error => {
        console.error(['Erro ao filtrar jobs', error])
      });
  }

  getFreelaLevel() {
    this.levelRuleService.getRulesByType(this.user.type.toLowerCase()).subscribe(
      success => {
        success = success.filter(item => (this.user.level >= item.pts_min && this.user.level <= item.pts_max));
        
        this.freelaLevel.pts_min = success[0].pts_min;
        this.freelaLevel.pts_max = success[0].pts_max;

        this.filter();
      },
      error => {
        console.error(['Erro ao recuperar regras de nível', error])
      }
    );
  }

  getJobsViewws() {
    for(const [index, item] of this.listJobs.entries()) {
      this.jobService.getJobViews(item.id).subscribe(
        (success) => {
          this.jobsViews = success;

          for (const [index, item] of this.jobsViews.entries()) {
            let viewer: number;
            if (typeof item.viewer === 'number') {
              viewer = item.viewer;
            }
            if (typeof item.viewer !== 'number') {
              viewer = item.viewer.id;
            }

            if (this.user.id === viewer) {
              this.listJobs[index].viewed = true;
              return;
            }
          }


        },
        error => {
          console.error([`Erro ao recuperar views do job ${item.title}`, error])
        }
      );

      this.proposalService.getByJob(item).subscribe(
        success => {
          success = success.filter(item => item.freelancer.id === this.user.id);
          
          if (success.length > 0) {
            this.listJobs[index].proposalSent = true;
          }
        },
        error => {
          console.error([`Erro ao recuperar propostas do job ${item.title}`, error])
        }
      )
    }

    this.orderJobs();
  }

  orderJobs() {
    this.listJobsBckp = this.listJobs;
    this.listJobs = this.listJobs.filter(item => item.featured);
    this.listJobsBckp = this.listJobsBckp.filter(item => !item.featured);

    this.listJobsBckp.forEach((item) => {
      this.listJobs.push(item);
    });

    this.listJobs.forEach((item, index) => {
      this.listJobs[index] = new Job(item);
    });

    this.ready = true;
  }

  goToDetais(jobID) {
    const job = this.listJobs.filter(item => item.id === jobID);

    if (job.length > 0 && job[0].proposalSent) {
      this.toastService.error(2000,'Você já enviou proposta para esse job');
      return;
    }
    
    this.router.navigateByUrl(`job/${jobID}`);
  }

  gotToSendProposal(jobID) {
    this.router.navigateByUrl(`job/${jobID}`);
  }

  goToProposal(jobId: number) {
    this.router.navigateByUrl(`/job/${jobId}/send-proposal`);
  }

  gotToQuestion(jobId: number) {
    this.router.navigateByUrl(`/job/${jobId}/send-question`);
  }

  selectType(event: any) {
    const value = Number(event.target.value);

    this.filter({name: 'type', value});
  }
  selectRanking(id: string, value: number) {
    const el = document.getElementById(id);

    if (el.classList.contains('filter-ranking-unsel')) {
      el.classList.add('filter-ranking-sel');
      el.classList.remove('filter-ranking-unsel');

      if (this.rankActual !== '') {
        document.getElementById(this.rankActual).classList.remove('filter-ranking-sel');
        document.getElementById(this.rankActual).classList.add('filter-ranking-unsel');
      }
      this.rankActual = id; 

      this.filter({name: 'ranking', value: value});
      return;

    }

    if (el.classList.contains('filter-ranking-sel')) {
      el.classList.add('filter-ranking-unsel');
      el.classList.remove('filter-ranking-sel');
      this.rankActual = '';
      
      this.filter({name: 'ranking', value: value});
      return;
    }
  }
  selectLevel(id: string, value: number) {
    const el = document.getElementById(id);

    if (el.classList.contains('filter-level-unsel')) {
      el.classList.add('filter-level-sel');
      el.classList.remove('filter-levle-unsel');
      if (this.levelActual !== '') {
        document.getElementById(this.levelActual).classList.remove('filter-level-sel');
        document.getElementById(this.levelActual).classList.add('filter-level-unsel');
      }
      this.levelActual = id; 

      this.filter({name: 'level', value: value});
      return;
    }

    if (el.classList.contains('filter-level-sel')) {
      el.classList.add('filter-level-unsel');
      el.classList.remove('filter-level-sel');
      this.levelActual = '';

      this.filter({name: 'level', value: value});
      return;
    }
  }
}
