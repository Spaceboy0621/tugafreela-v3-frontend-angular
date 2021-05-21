import { Router } from '@angular/router';
import { RunToastUtil } from './../../../utils/run-toast.util';
import { UploadService } from '../../../services/upload.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ENV } from '../../../../environments/environment';
import { Category } from '../../../models/category.model';
import { Skill } from '../../../models/skill.model';
import { User } from '../../../models/user.model';
import { CategoriesService } from '../../../services/categories.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  user: User;
  listSkills: Skill[] = [];
  listCategories: Category[];

  previewPhoto: string;
  formProfile: FormGroup;

  skillsData = [];
  skillsSelected = [];
  categoriesData = [];
  categoriesSelected = [];

  dropdownSettings = {};

  modalConfirm: boolean = false;

  @ViewChild('profilePhoto') profilePhoto: ElementRef<HTMLElement>;

  constructor(
    private categoriesService: CategoriesService,
    private userService: UserService,
    private uploadService: UploadService,
    private runToastUtil: RunToastUtil,
    private router: Router
  ) { }

  ngOnInit(): void {
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
      this.loadUser();
    }, e => {
      console.log(e);
    });
  }

  private loadUser() {
    // CARREGANDO DADOS DO USUARIO
    this.user = JSON.parse(localStorage.getItem("user"));

    this.user = new User(this.user);
    // ALIMENTANDO SELECTS COM OS DADOS SALVOS
    this.skillsSelected = this.user.skills.map(s => {
      return { "id": s.id, "itemName": s.name };
    });
    this.categoriesSelected = this.user.categories.map(c => {
      return { "id": c.id, "itemName": c.name };
    });
    this.loadSkills();
    let id;
    if (typeof this.user.photo === 'number') id = this.user.photo;

    if(typeof this.user.photo !== 'number') id = this.user.photo.id;

    this.uploadService.getById(id).subscribe(
      success => {
        this.user.photo = success;
      },
      error => console.error(error)
    );

    this.previewPhoto = `${ENV.API_URL}/${this.user.photo?.url}`;
    this.user.hour_value = (this.user.hour_value ? this.user.hour_value.toFixed(2) : null);
  }

  async openPhotoUpload() {
    const element: HTMLElement = this.profilePhoto.nativeElement;
    element.click();
  }

  changePhoto(files: FileList) {
    const form = new FormData();
    form.append('files', files[0]);
    form.append('ref', 'users');
    form.append('filed', 'photo');
    form.append('refId', `${this.user.id}`);

    this.userService.uploadPhoto(form).subscribe(async (result) => {
      // EXCLUIR IMAGEM ANTIGA
      if (this.user.photo) {
        this.deletePhoto(this.user.photo.id);
      }

      // ATUALIZANDO PERFIL COM A NOVA IMAGEM.
      this.user.photo = result[0];
      this.previewPhoto = `${ENV.API_URL}${this.user.photo?.url}`;

      await this.userService.update(this.user).toPromise();
      localStorage.setItem("user", JSON.stringify(this.user));
    }, e => {
      console.log(e);
    });
  }

  // DELETAR FOTO DE PERFIL
  deletePhoto(idPhoto: number) {
    this.userService.deletePhoto(idPhoto).subscribe(result => {
    });
  }

  modalEvent(event) {
    if (event === 'confirm') {
      this.saveProfile();
      return;
    }
    if (event === 'hide') {
      this.modalConfirm = false;
      return;
    }
  }

  saveProfile() {
    this.parserSelectsToField();
    this.user.hour_value = (this.user.hour_value/100).toFixed(2);
    this.userService.update(this.user).subscribe(result => {
      localStorage.setItem("user", JSON.stringify(result));
      this.runToastUtil.success(2000, 'Alterações feitas com sucesso');
      setTimeout(() => {
        this.router.navigateByUrl('me/profile');
      }, 2000)
    });
  }

  private parserSelectsToField() {
    this.user.skills = [];
    this.skillsSelected.forEach(item => {
      const itemSelect = this.listSkills.filter(i => i.id === item.id);
      this.user.skills = this.user.skills.concat(itemSelect);
    });

    this.user.categories = [];
    this.categoriesSelected.forEach(item => {
      const itemSelect = this.listCategories.filter(i => i.id === item.id);
      this.user.categories = this.user.categories.concat(itemSelect);
    });
  }

  onItemSelect(item: any, limit: number, isCategories: boolean) {
    if (isCategories) {
      if (limit < this.categoriesSelected.length) {
        this.categoriesSelected.pop();
        return;
      }

      // BUSCAR CATEGORIA NA LISTA E PEGAR AS HABILIDADES
      this.loadSkills();
      return;
    }

    if (limit < this.skillsSelected.length) {
      this.skillsSelected.pop();
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

    this.categoriesSelected.forEach(c => {
      const category: Category = this.listCategories.filter(i => i.id === c.id)[0];
      this.listSkills = this.listSkills.concat(category.skills);

      this.skillsData = this.skillsData.concat(category.skills.map(s => {
        return { "id": s.id, "itemName": s.name }
      }));
    });
  }

}
