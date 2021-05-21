import { CreditCardService } from './../../../services/credit-card.service';
import { RunToastUtil } from './../../../utils/run-toast.util';
import { ToastrService } from 'ngx-toastr';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../../../models/category.model';
import { Job } from '../../../models/job.model';
import { Skill } from '../../../models/skill.model';
import { User } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { JobService } from '../../../services/job.service';
import { LoadingService } from '../../../services/loading.service';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-new-job',
  templateUrl: './new-job.component.html',
  styleUrls: ['./new-job.component.scss']
})
export class NewJobComponent implements OnInit {
  listSkills: Skill[] = [];
  listCategories: Category[];
  
  skillsData = [];
  skillsSelected = [];
  categoriesData = [];
  categoriesSelected = [];

  dropdownSettings = {};

  job: Job;
  userLogged: User;

  @ViewChild('attachFile') attachFile: ElementRef<HTMLElement>;
  filesAttached: File[] = [];

  formJob: FormGroup;
  owner: User;

  showFeatureUrgent: boolean = false;

  loading: boolean = false;

  constructor(
    private categoriesService: CategoriesService,
    private loadingService: LoadingService,
    private uploadService: UploadService,
    private jobService: JobService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private runToastUtil: RunToastUtil,
    private creditCardService: CreditCardService
  ) { }

  ngOnInit(): void {
    this.userLogged = JSON.parse(localStorage.getItem('user'));
    
    this.creditCardService.hasVerifiedPayment(this.userLogged.id);

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if (this.showFeatureUrgent && target.classList.contains('bg')) {
        this.showFeatureUrgent = false;
      }
    });

    this.uploadService.list().subscribe(
      success => console.log(success),
      error => console.error(error)
    )

    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      enableSearchFilter: true,
      text: "Nenhum item selecionado...",
      classes: "skills-select",
      searchPlaceholderText: "Pesquisar...",
    };

    // BUSCANDO CATEGORIAS
    this.categoriesService.get().subscribe(result => {
      this.categoriesData = result.map(c => {
        return { "id": c.id, "itemName": c.name };
      });

      this.listCategories = result;
      // this.loadJob();
    }, e => {
      console.error(e);
    });

    this.owner = JSON.parse(localStorage.getItem("user"));
    this.formJob = this.fb.group({
      categories: [[], [Validators.required]],
      skills: [[], [Validators.required]],
      title: [null, [Validators.required]],
      description: ['', [Validators.required, Validators.minLength]],
      level_experience: [null, [Validators.required]],
      type: ['', [Validators.required]],
      owner: [this.owner, [Validators.required]],
      status: ["ativo", [Validators.required]],
      valueJob: [''],
      hours: [null],
      valueHour: ['']
    });

  }

  getEventTypeJob(event: string) {
    if (event === 'featured') {

      const item = 'Pacote de Destaque - 5 dias';
      const price = 10;
      const type = 'featured';
  
      this.create(item, type, price);
    }

    if (event === 'urgent') {
      const item = 'Pacote de Urgência';
      const price = 15;
      const type = 'urgent';

      this.create(item, type, price);
    }

    if (event === 'continue') {
      this.showFeatureUrgent = false;
      this.create();
    }
  }

  calculateTotalValueHour() {
    this.formJob.value.valueJob = this.formJob.value.hours * this.formJob.value.valueHour;
    
    const input = document.getElementById('valueHourTotal') as HTMLInputElement;

    input.value = this.formJob.value.valueJob;
  }



  async openAttachFile() {
    const element: HTMLElement = this.attachFile.nativeElement;
    element.click();
  }

  changeFile(files: FileList) {
    this.filesAttached = this.filesAttached.concat(Array.prototype.slice.call(files));
  }

  removeFile(index: number) {
    this.filesAttached.splice(index, 1);
  }

  uploadFiles(item?: string, type?: string, price?: number) {
    const form = new FormData();

    this.filesAttached.forEach(file => {
      form.append('files', file);
    });
    form.append('ref', 'job');
    form.append('filed', 'files_attached');
    form.append('refId', `${this.job.id}`);

    this.uploadService.upload(form).subscribe(
      result => {
        this.job.files_attached = result.map(r => r.id);

        this.jobService.update(this.job.id, this.job).subscribe(
          result => {
            this.loadingService.show = false;
            this.showFeatureUrgent = false;

            if (type && item && price) {
              this.runToastUtil.success(2000, 'Job criado com sucesso. Redirecionando para a tela de pagamento...');
              setTimeout(() => {
                this.router.navigateByUrl(`/checkout/${item}/${price}/${type}/${this.job.id}`);
              }, 2000)
            }
            else {
              this.runToastUtil.success(2000, 'Job criado com sucesso.');
              this.router.navigateByUrl("/dashboard");
            }
        });
      });
  }

  create(item?: string, type?: string, price?: number) {
    this.loading = true;

    if (this.formJob.value.description.length < 150) {
      this.runError('Descrição deve ter pelo menos 150 caracteres', 'Ops! Algo deu errado');
      this.loading = false;
      return;
    }

    if(!this.formJob.valid) {
      this.runError('Por Favor, preencha todos os campos', 'Ops! Algo deu errado');
      this.loading = false;
      return;
    }

    this.parserSelectsToField();
  
    this.jobService.create(this.formJob.value).subscribe(result => {
      this.job = result;

      if (this.filesAttached.length !== 0) {
        this.uploadFiles();
      }
      else {

        this.loadingService.show = false;
        this.showFeatureUrgent = false;
        if (type && item && price) {
          this.runToastUtil.success(2000, 'Job criado com sucesso. Redirecionando para a tela de pagamento...');
          setTimeout(() => {
            this.router.navigateByUrl(`/checkout/${item}/${price}/${type}/${this.job.id}`);
          }, 2000)
        }
        else {
          this.runToastUtil.success(2000, 'Job criado com sucesso.');
          this.router.navigateByUrl("/dashboard");
        }

      }
    }, e => {

      this.loading = false;
      this.runError('Algo deu errado durante a publicação', 'Ops! Algo deu errado');
      console.error(e);

    });
  }

  onItemSelect(item: any, limit: number, isCategories: boolean) {
    if (isCategories) {
      if (limit < this.formJob.value.categories.length) {
        this.formJob.value.categories.pop();
        return;
      }

      // BUSCAR CATEGORIA NA LISTA E PEGAR AS HABILIDADES
      this.loadSkills();
      return;
    }

    if (limit < this.formJob.value.skills.length) {
      this.formJob.value.skills.pop();
      return;
    }
  }

  OnItemDeSelect(item: any, isCategories) {
    if (isCategories) {
      this.loadSkills();
      
      const category: Category = this.listCategories.filter(i => i.id === item.id)[0];
      category.skills.forEach(s => {

        const index = this.skillsSelected.map(skill => skill.id).indexOf(s.id);
        if(index > -1){
          this.skillsSelected.splice(index, 1);
        }
      });
    }

  }

  private loadSkills() {
    // ZERANDO LISTAS DE HABILIDADES
    this.skillsData = [];
    this.listSkills = [];
    this.formJob.value.categories.forEach(c => {
      const category: Category = this.listCategories.filter(i => i.id === c.id)[0];
      this.listSkills = this.listSkills.concat(category.skills);

      this.skillsData = this.skillsData.concat(category.skills.map(s => {
        return { "id": s.id, "itemName": s.name }
      }));
    });
  }

  private parserSelectsToField() {
    this.skillsSelected = [];
    this.formJob.value.skills.forEach(item => {
      const itemSelect = this.listSkills.filter(i => i.id === item.id);
      this.skillsSelected = this.skillsSelected.concat(itemSelect);
    });

    this.categoriesSelected = [];
    this.formJob.value.categories.forEach(item => {
      const itemSelect = this.listCategories.filter(i => i.id === item.id);
      this.categoriesSelected = this.categoriesSelected.concat(itemSelect);
    });

    this.formJob.value.skills = this.skillsSelected;
    this.formJob.value.categories = this.categoriesSelected;
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
