import { NotificationService } from '../../../services/notification.service';
import { LoadingService } from '../../../services/loading.service';
import { UploadService } from '../../../services/upload.service';
import { JobService } from '../../../services/job.service';
import { CategoriesService } from '../../../services/categories.service';
import { Category } from '../../../models/category.model';
import { Skill } from '../../../models/skill.model';
import { Notification, User } from '../../../models/user.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Job } from '../../../models/job.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.scss']
})
export class EditJobComponent implements OnInit {

  jobId: number;

  listSkills: Skill[] = [];
  listCategories: Category[];
  
  skillsData = [];
  skillsSelected = [];
  categoriesData = [];
  categoriesSelected = [];

  dropdownSettings = {};

  job: Job;

  @ViewChild('attachFile') attachFile: ElementRef<HTMLElement>;
  filesAttached: File[] = [];

  formJob: FormGroup;
  owner: User;

  ready: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService,
    private fb: FormBuilder,
    private jobService: JobService,
    private uploadService: UploadService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.owner = JSON.parse(localStorage.getItem("user"));

    this.route.params.subscribe(
      (params) => this.jobService.getById(params['jobID']).subscribe(
        result => {
          this.job = result;
          console.log(this.job);
          this.configDrop();
          this.buildForm();
        },
        error => console.error(error)
      )
    )

    
  }

  update() {
    this.parserSelectsToField();
    this.loadingService.show = true;

    this.jobService.update(this.job.id, this.formJob.value).subscribe(
      (success) => {
        if (this.filesAttached.length !== 0) {
          this.uploadFiles();
        }

        this.loadingService.show = false;

        this.job.proposals.forEach((item) => {
          this.notificationService.notify(
            new Notification({
              job: this.job,
              user: item.freelancer,
              text: `'${this.owner.name}' fez uma edição no projeto '${this.job.title}'.`,
              read: false,
              link: `job/${this.job.id}`
            })
          ).subscribe(
            success => console.log('Sucesso ao enviar notificações', success),
            error => console.error('Erro ao enviar notificações', error)
          )
        });

        this.router.navigateByUrl("/dashboard");
      }, 
      (error) => {
        this.loadingService.show = false;
        alert("Um erro aconteceu");
        console.error(error);

    });
  }

  buildForm() {
    let categories = [];
    let skills = [];

    this.job.skills.forEach((item, index) => {
      skills.push({id: item.id, itemName: item.name});
    });

    this.job.categories.forEach((item, index) => {
      categories.push({id: item.id, itemName: item.name});
    });

    this.formJob = this.fb.group({
      categories: [categories, [Validators.required]],
      skills: [skills, [Validators.required]],
      title: [this.job.title, [Validators.required]],
      description: [this.job.description, [Validators.required, Validators.minLength]],
      level_experience: [this.job.level_experience, [Validators.required]],
      type: [this.job.type, [Validators.required]],
      owner: [this.owner, [Validators.required]],
      status: [this.job.status, [Validators.required]]
    });

    this.ready = true;
  }

  configDrop() {
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      enableSearchFilter: true,
      text: "",
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

  uploadFiles() {
    const form = new FormData();

    this.filesAttached.forEach(file => {
      form.append('files', file);
    });
    form.append('ref', 'job');
    form.append('filed', 'files_attached');
    form.append('refId', `${this.job.id}`);

    this.uploadService.upload(form).subscribe(result => {
      this.job.files_attached = result.map(r => r.id);
      this.jobService.update(this.job.id, this.job).subscribe(result => {
      });
    })
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

}
