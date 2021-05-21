import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AuthResponse, User } from '../../../models/user.model';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  type: string;
  formUser: FormGroup;
  loader: boolean = false;
  step: number = 1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    if(this.authService.isLogged()) {
      this.router.navigateByUrl("me/profile/edit");
    }
  }

  ngOnInit(): void {
    this.formUser = this.fb.group({
      type: [this.activatedRoute.snapshot.paramMap.get('type'), [Validators.required]],
      name: ['', [Validators.required]],
      nick: ['', [Validators.required]],
      nif: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      confirm_email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
      level: [0, [Validators.required]],
      confirmed: [false, [Validators.required]],
      check_terms: [false, Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      floor: [''],
      cep: ['', Validators.required],
      city: ['', Validators.required],
      birthDate: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }
  
  validateStep1() {
    
    if (this.formUser.value.name === '') {
      this.runError( 'Campo nome é obrigatório', 'Ops! Algo deu errado');
      return;
    }
    if (this.formUser.value.nick === '') {
      this.runError( 'Campo aplido é obrigatório', 'Ops! Algo deu errado');
      return;
    }
    if (this.formUser.value.nif === '') {
      this.runError( 'Campo nif é obrigatório', 'Ops! Algo deu errado');
      return;
    }
    if (this.formUser.value.email === '') {
      this.runError( 'Campo email é obrigatório', 'Ops! Algo deu errado');
      return;
    }
    if (this.formUser.value.confirm_email === '') {
      this.runError( 'Campo confirmar email é obrigatório', 'Ops! Algo deu errado');
      return;
    } 
    if (this.formUser.value.password === '') {
      this.runError( 'Campo senha é obrigatório', 'Ops! Algo deu errado');
      return;
    }
    if (this.formUser.value.confirm_password === '') {
      this.runError( 'Campo confirmar senha é obrigatório', 'Ops! Algo deu errado');
      return;
    }

    if (this.formUser.value.email !== this.formUser.value.confirm_email) {
      this.runError( 'E-mails não conferem', 'Ops! Algo deu errado');
      return;
    }

    if (this.formUser.value.password !== this.formUser.value.confirm_password) {
      this.runError( 'Senhas não conferem', 'Ops! Algo deu errado');
      return;
    }

    const nifIsValid = this.validateNifNumber();

    if (!nifIsValid) {
      this.runError('NIF Inválido', 'Ops! Algo deu errado');
      return;
    }

    if(!this.formUser.value.check_terms) {
      this.runError('Você deve ler e aceitar os termos de uso','Ops! Algo deu errado');
      return;
    }

    this.step = 2;
  }

  newUser() {
    if(!this.formUser.valid){
      this.runError( 'Por favor preencha todos os campos.', 'Ops! Algo deu errado');
      return;
    }

    this.loader = true;

    const user: User = this.formUser.value;
    user.username  = user.email;
   
    this.authService.register(user).subscribe(
      (result: AuthResponse) => {
        this.loader = false;
        this.router.navigateByUrl("signup/created");
        console.log(result);
      },
      (error) => {
        console.log(error);
        this.loader = false;
        this.runError((error.error.message[0].messages[0].message || 'Erro inesperado'), 'OPS! Algo deu errado');
    });
  }

  validateNifNumber() {

    const nif = typeof this.formUser.value.nif === 'string' ? this.formUser.value.nif : this.formUser.value.nif.toString();

    const validationSets = {
      one: ['1', '2', '3', '5', '6', '8'],
      two: ['45', '70', '71', '72', '74', '75', '77', '79', '90', '91', '98', '99']
    }
    
    if (nif.length !== 9) return false;
    if (!validationSets.one.includes(nif.substr(0,1)) && !validationSets.two.includes(nif.substr(0,2))) return false;

    const total = nif[0] * 9 + nif[1] * 8 + nif[2] * 7 + nif[3] * 6 + nif[4] * 5 + nif[5] * 4 + nif[6] * 3 + nif[7] * 2;
    const modulo11 = (Number(total) % 11);

    const checkDigit = modulo11 < 2 ? 0 : 11 - modulo11;

    return checkDigit === Number(nif[8]);
  }

  validateNifApi() {

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
