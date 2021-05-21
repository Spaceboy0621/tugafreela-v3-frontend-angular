import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {
  private code: string;
  formPassword: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.code = this.activatedRoute.snapshot.queryParamMap.get("code");
    if(!this.code) {
      this.router.navigateByUrl('/');
      return;
    }

    this.formPassword = this.fb.group({
      code: [this.code, [Validators.required]],
      password: [null, [Validators.required]],
      passwordConfirmation: [null, [Validators.required]],
    });
  }

  save() {
    if(this.formPassword.value.password != this.formPassword.value.passwordConfirmation) {
      this.runError('As senhas não conferem.', 'OPs! Algo deu errado');
      return;
    }

    this.authService.newPassword(this.formPassword.value).subscribe(result => {
      this.runError('Nova senha criada com sucesso, você será redirecionado...', 'BOA! Tudo certo');
      this.router.navigateByUrl('/login');
    }, e => {
      console.log(e);
    });
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
