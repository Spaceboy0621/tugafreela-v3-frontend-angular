import { RunToastUtil } from './../../../utils/run-toast.util';
import { User } from './../../../models/user.model';
import { ValidateUtil } from './../../../utils/validate.util';
import { CreditCardService } from './../../../services/credit-card.service';
import { CreditCardModel } from './../../../models/credit-card.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-credit-card',
  templateUrl: './form-credit-card.component.html',
  styleUrls: ['./form-credit-card.component.scss']
})
export class FormCreditCardComponent implements OnInit {

  @Input() credit_card: CreditCardModel;
  @Input() type: string = 'add';
 
  form: FormGroup;

  cpfInvalid: boolean;
  numberInvalid: boolean;
  cvvInvalid: boolean;

  user: User;
  countries = [];

  constructor(
    private fb: FormBuilder,
    private creditCardService: CreditCardService,
    private validateUtil: ValidateUtil,
    private runToastUtil: RunToastUtil
  ) { 
    this.countries = this.creditCardService.returnCountries();
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    
    if (this.type === 'update') {
      this.form = this.fb.group({
        surname: [this.credit_card.surname, Validators.required],
        expiration_date_month: [this.credit_card.expiration_date_month, [Validators.required, Validators.maxLength(2), Validators.minLength(2), Validators.max(12)]],
        expiration_date_year: [this.credit_card.expiration_date_year, [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.min(new Date().getFullYear())]],
        cvv: [this.credit_card.cvv, Validators.required],
        name_on_the_card: [this.credit_card.name_on_the_card, Validators.required],
        country: [this.credit_card.country, Validators.required],
        number: [this.credit_card.number, Validators.required],
        flag: [this.credit_card.flag],
        type_card: ['']
      });
    }
    
    if (this.type === 'add') {
      this.form = this.fb.group({
        surname: ['', Validators.required],
        expiration_date_month: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2), Validators.max(12)]],
        expiration_date_year: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.min(new Date().getFullYear())]],
        cvv: ['', Validators.required],
        name_on_the_card: ['', Validators.required],
        country: ['', Validators.required],
        number: ['', Validators.required],
        flag: [''],
        type_card: ['']
      });
    }
  }


  submit() {
    if (this.type === 'add') {
      this.add();
      return;
    }

    if (this.type === 'update') {
      this.update();
      return;
    }
  }

  add() {
    if (!this.validateForm()) {
      return;
    }

    if(this.form.controls.flag.value === '') {
      this.form.value.flag = this.validateUtil.getFlag(this.form.controls.number.value).flag;
    }

    this.form.value.card_owner = this.user.id;

    this.creditCardService.create(this.form.value).subscribe(
      success => {
        this.runToastUtil.success(2000, `Cartão '${this.form.controls.surname.value}' salvo com sucesso`);
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao salvar cartão');
        console.error(['Erro ao salvar cartão', error])
      }
    )
  }

  
  update() {
    if (!this.validateForm()) {
      return;
    }

    this.creditCardService.update(this.credit_card.id, this.form.value).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Cartão atualizado com sucesso');
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao atualizar cartão');
        console.error(['Erro ao atualizar cartão', error]);
      }
    )
  }

  cancel() {
    scrollTo(0,0);
    location.reload();
  }

  validateForm(): boolean {
    let valid = true;

    if (!this.form.valid) {
      this.runToastUtil.error(2000, 'Verifique todos os campos!');
      valid = false;
      return;
    }

    if (!this.validateUtil.creditCard(this.form.controls.number.value)){
      this.runToastUtil.error(2000, 'Número do cartão inválido');
      valid = false;
      return;
    }

    return valid;
  }

  validateCardNumber() {
   
    if (!this.validateUtil.creditCard(this.form.controls.number.value)){
      this.numberInvalid = true;
    }
    else {
      this.numberInvalid = false;
      this.form.value.number = this.form.controls.number.value.replace(/[^0-9]+/g, '');
      
    }
  }

  validateCVV() {
    if (!this.validateUtil.creditCardCvv(this.validateUtil.getFlag(this.form.controls.number.value).flag, this.form.controls.cvv.value)) {
      this.cvvInvalid = true;
    }
    else {
      this.cvvInvalid = false;
    }
  }

}
