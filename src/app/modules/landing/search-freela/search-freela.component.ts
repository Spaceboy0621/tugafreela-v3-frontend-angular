import { LevelRulesService } from './../../../services/level-rules.service';
import { CategoriesService } from '../../../services/categories.service';
import { ActivatedRoute } from '@angular/router';
import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { Rating, User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { debounceTime, filter, map } from "rxjs/operators";

interface Parameter {
  name: string;
  value: number;
}

@Component({
  selector: 'app-search-freela',
  templateUrl: './search-freela.component.html',
  styleUrls: ['./search-freela.component.scss']
})
export class SearchFreelaComponent implements OnInit {
  // @ViewChild('freelaSearchInput', { static: true }) freelaSearchInput: ElementRef;
  freelaSearchInput: string = '';
  clearCategories: EventEmitter<boolean> = new EventEmitter();

  user: User;

  categoriesFilter: number[];
  levelSelected: any = -1;
  nameFilter: string;
  idChecked: string;
  ready: boolean = false;

  listUsersBckp: User[];
  listUsers: User[];
  rankActual: string = '';
  levelActual: string = '';

  ratingFilterCtrl = new FormControl(null, Validators.required);

  clientLevel = {
    min: 0,
    max: 0
  }
  constructor(
    private userService: UserService,
    private categoriesService: CategoriesService,
    private route: ActivatedRoute,
    private levelRuleService: LevelRulesService
  ) { }

  ngOnInit(): void {

    this.user = JSON.parse(localStorage.getItem('user'));
    this.user = new User(this.user);

    this.route.params.subscribe(
      params =>  {
        if (params['category']) {
          this.categoriesService.getById(Number(params['category'])).subscribe(
            success => {
              this.idChecked = `categoryCheckbox${Number(params['category'])}`;
              
              this.filterByCategories(success)
              
            },
            error => console.error(error)
          )
        }
      }
    );

    this.getClientLevel();
    this.ready = true;
  }

  filterByName() {
    if (this.freelaSearchInput.length > 3) {
      this.nameFilter = this.freelaSearchInput;
      this.filterUsers({name: 'name', value: 0});
    }
  }

  resetFilters() {
    this.freelaSearchInput = '';
    this.categoriesFilter = [];
    this.nameFilter = "";
    this.rankActual = '';
    this.levelActual = '';

    this.clearCategories.emit(true);

    const elRanking  = document.getElementsByClassName('filter-ranking-sel')[0];
    const elLevel = document.getElementsByClassName('filter-level-sel')[0];

    if (elRanking) {
      elRanking.classList.remove('filter-ranking-sel');
      elRanking.classList.add('filter-ranking-unsel');
    }
    if (elLevel) {
      elLevel.classList.remove('filter-level-sel');
      elLevel.classList.add('filter-level-unsel');
    }

    this.filterUsers();
  }

  
   //Filtrar usuarios de acordo com as categorias selecionadas.

  filterByCategories(listaCategories) {
    this.categoriesFilter = listaCategories.map(c => c.id);
    this.getClientLevel();
  }

 
   // Filtro geral
  private filterUsers(parameter?: Parameter ) {

    //Std filter: Filter by type (just freelas) and level;
    this.userService.search({}).subscribe(
      success => {
        this.listUsers = success.filter(item => (item.type === 'Freelancer' && item.level <= this.clientLevel.max));

        this.listUsers.forEach((item, index) => {
          this.listUsers[index] = new User(item);
        });

        this.listUsersBckp = this.listUsers;

        if (parameter && parameter.name === 'categories') {
          this.userService.search({categories: this.categoriesFilter, name: this.nameFilter}).subscribe(
            success => {
              this.listUsers = success.filter(item => item.type === 'Freelancer');
              this.listUsersBckp = this.listUsers;
            }, 
            error => {
              console.error(['Erro ao filtrar usuários por categoria', error]);
            });
        }
        
        //Filter by level
        if (parameter && parameter.name === 'level') {
          let min: number;
          let max: number = parameter.value;
    
          if (max === 35) min = 0;
          if (max === 70) min = 36;
          if (max === 100) min = 76;
          if (max === 1000) min = 101;
    
          this.filterByLevel(min, max);
    
        }
        
        //Filter by ranking
        if (parameter && parameter.name === 'ranking') {
          this.filterByRanking(parameter.value);
        }

        //Filter by name
        if (parameter && parameter.name === 'name') {
          this.nameFilter = this.nameFilter.toLowerCase();
          const regex = new RegExp(`^.*${this.nameFilter}.*$`);
          this.listUsers = this.listUsers.filter(item => item.name.toLowerCase().match(regex))
        }

      }, error => {
        console.error(['Erro ao buscar usuários', error])
      }); 

    
    
  }

  //Filter by level
  filterByLevel(min: number, max: number) {
    this.listUsers = this.listUsers.filter(item => (item.level >= min && item.level <= max));
  }

  //FilterByRanking
  filterByRanking(value: number) {
    this.listUsers = this.listUsers.filter(item => item.getMediaRating() <= value);
  }

  getClientLevel() {
    this.levelRuleService.getRulesByType(this.user.type.toLowerCase()).subscribe(
      success => {
        success = success.filter(item => (this.user.level >= item.pts_min && this.user.level <= item.pts_max));
        
        this.clientLevel.min = success[0].pts_min;
        this.clientLevel.max = success[0].pts_max;

        this.filterUsers();
      },
      error => {
        console.error(['Erro ao recuperar regras de nível', error])
      }
    );
  }

  //Calculate rating average
  getMediaRating(ratings: Rating[]) {
    if (ratings.length === 0) return 0;

    const total = ratings.map(r => r.rating).reduce( (a, b) => a + b);
    return total / ratings?.length;
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
      this.filterUsers({name: 'ranking', value});
      return;
    }

    if (el.classList.contains('filter-ranking-sel')) {
      el.classList.add('filter-ranking-unsel');
      el.classList.remove('filter-ranking-sel');
      this.rankActual = '';
      this.filterUsers({name: 'ranking', value});
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

      this.filterUsers({name: 'level', value});
      return;
    }

    if (el.classList.contains('filter-level-sel')) {
      el.classList.add('filter-level-unsel');
      el.classList.remove('filter-level-sel');
      this.levelActual = '';
      this.filterUsers({name: 'level', value});
      return;
    }
  }

}
