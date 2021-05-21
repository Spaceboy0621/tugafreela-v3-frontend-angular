import { UploadService } from '../../../services/upload.service';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Skill } from '../../../models/skill.model';
import { Category } from '../../../models/category.model';
import { CategoriesService } from '../../../services/categories.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-account-confirmed',
  templateUrl: './account-confirmed.component.html',
  styleUrls: ['./account-confirmed.component.scss']
})
export class AccountConfirmedComponent implements OnInit {

  skillsData = [];
  skillsSelected = [];
  categoriesData = [];
  categoriesSelected = [];
  
  listCategories: Category[];
  listSkills: Skill[];

  dropdownCategoriesSettings = {};
  dropdownSkillsSettings = {}

  formCompleteInfosFreela: FormGroup;
  formCompleteInfosClient: FormGroup;

  user: User;
  type: string = '';
  loader: boolean = false;

  photoPreview: string | ArrayBuffer = '../../../../assets/img/icons/camera.svg';

  removePhoto: boolean = false;
  
  @ViewChild('attachFile') attachFile: ElementRef<HTMLElement>;
  profilePhoto: File;

  constructor(
    private categoriesService: CategoriesService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private userService: UserService,
    private router: Router,
    private uploadService: UploadService
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.type = 'Freelancer';

    this.formCompleteInfosFreela = this.fb.group({
      professionalTitle: ['', Validators.required],
      valueHour: [''],
      description: ['', Validators.required],
      categories: [[], Validators.required],
      skills: [[], Validators.required]
    });

    this.formCompleteInfosClient = this.fb.group({
      profileTitle: ['', Validators.required],
      description: ['', Validators.required]
    })

    this.dropdownCategoriesSettings = {
      enableCheckAll: false,
      singleSelection: false,
      enableSearchFilter: true,
      text: "Categoria",
      classes: "skills-select",
      searchPlaceholderText: "Pesquisar...",
      noDataLabel: 'Nenhuma categoria encontrada',
      limitSelection: 3
    };

    this.dropdownSkillsSettings = {
      enableCheckAll: false,
      singleSelection: false,
      enableSearchFilter: true,
      text: "Sub-Categoria",
      classes: "skills-select",
      searchPlaceholderText: "Pesquisar...",
      noDataLabel: 'Selecione uma categoria',
      limitSelection: 9, 
      groupBy: 'categoryName'  
    };


    // BUSCANDO CATEGORIAS
    this.categoriesService.get().subscribe(
      success => {
        this.categoriesData = success.map(c => {
          return { "id": c.id, "itemName": c.name };
        });

        this.categoriesData.sort((a, b) => {
          if (a.id > b.id) {
            return ;
          }
          if (a.id < b.id) {
            return -1;
          }
          return 0;
  
        });

        this.listCategories = success;
      }, 
      error => console.error(error) 
    )
  }

  onItemSelect(item: any, limit: number, isCategories: boolean) {
    if (isCategories) {
      if (limit < this.formCompleteInfosFreela.value.categories.length) {
        this.formCompleteInfosFreela.value.categories.pop();
        return;
      }

      // BUSCAR CATEGORIA NA LISTA E PEGAR AS HABILIDADES
      this.loadSkills();
      return;
    }

    if (limit < this.formCompleteInfosFreela.value.skills.length) {
      this.formCompleteInfosFreela.value.skills.pop();
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
    this.formCompleteInfosFreela.value.categories.forEach(c => {
      const category: Category = this.listCategories.filter(i => i.id === c.id)[0];

      this.listSkills = this.listSkills.concat(category.skills);
      
      this.skillsData = this.skillsData.concat(category.skills.map(s => {
        return { "categoryName": category.name, "category": s.category, "id": s.id, "itemName": s.name }
      }));

      this.skillsData.sort((a, b) => {
        if (a.id > b.id) {
          return ;
        }
        if (a.id < b.id) {
          return -1;
        }
        return 0;

      });

    });
    
  }

  uploadPhoto() {
    const form = new FormData();

    form.append('files', this.profilePhoto);

    form.append('ref', 'user');
    form.append('filed', 'photo');
    form.append('refId', `${this.user.id}`);

    this.uploadService.upload(form).subscribe(result => {
      this.user.photo = result.map(r => r.id);

      this.userService.update(this.user).subscribe(
        success => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          this.loader = false;
          this.runSuccess('Informações salvas! Você será redirecionado', 'Boa! Deu tudo certo');
          setTimeout(() => {
            this.router.navigateByUrl('login');
          }, 3000)
      },
      error => {
        this.loader = false;
        this.toastrService.error('Erro ao fazer upload de imagem', 'Ops! Algo deu errado');
      }
      )

    })
  }

  completeFreela() {
    
    if (!this.formCompleteInfosFreela.valid) {
      this.runError('Verifique todos os campos', 'Ops! Algo deu errado');
      return;
    }

    if (!this.profilePhoto) {
      this.runError('Foto de perfil é obrigatório', 'Ops! Algo deu errado');
      return;
    }
    
    this.loader = true;

    
    this.user.about = this.formCompleteInfosFreela.value.description;
    this.user.professional_description = this.formCompleteInfosFreela.value.professionalTitle;
    this.user.hour_value = this.formCompleteInfosFreela.value.valueHour;
    this.user.categories = this.formCompleteInfosFreela.value.categories;
    this.user.skills = this.formCompleteInfosFreela.value.skills;
    this.user.complete = true;

    this.userService.update(this.user).subscribe(
      success => {
        this.uploadPhoto();
      },
      error => {
        this.loader = false;
        this.toastrService.error('Erro ao salvar as informações', 'Ops! Algo deu errado');
      }
    )
    
  }

  completeClient() {
    if (!this.formCompleteInfosClient.valid) {
      this.runError('Verifique todos os campos', 'Ops! Algo deu errado');
      return;
    }

    this.loader = true;

    this.user.professional_description = this.formCompleteInfosClient.value.profileTitle;
    this.user.about = this.formCompleteInfosClient.value.description;
    this.user.complete = true;

    this.userService.update(this.user).subscribe(
      success => {
        this.uploadPhoto();
      },
      error => {
        this.loader = false;
        this.runError('Erro ao salvar as informações', 'Ops! Algo deu errado');
      }
    )
  }

  addFile(files: FileList) {
    this.profilePhoto = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      this.photoPreview = event.target.result;
    }

    reader.readAsDataURL(this.profilePhoto);
  }

  async openAttachFile() {
    const element: HTMLElement = this.attachFile.nativeElement;
    
    element.click();
  }


  removeFile() {
    const element = document.getElementById('profilePhoto') as HTMLInputElement;
    element.value = '';
    this.profilePhoto = null;
    this.photoPreview = '../../../../assets/img/icons/camera.svg';
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
