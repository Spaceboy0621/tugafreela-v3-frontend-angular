import { RunToastUtil } from './../../../utils/run-toast.util';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponse } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  msgError: string;
  formLogin: FormGroup;
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private runToastUtil: RunToastUtil
  ) {
    if(this.authService.isLogged()) {
      this.router.navigateByUrl("dashboard");
    }
  }

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      identifier: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
    });
  }

  login() {
    this.authService.auth(this.formLogin.value).subscribe((result: AuthResponse) => {
      if (result.user.accountStatus === 'inactive') {
        this.runToastUtil.error(2000, 'Usuário inativo. Não é possível fazer login');
        this.msgError = 'Usuário inativo';
        return;
      }

      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("token", result.jwt);
      if (result.user.complete) {
        this.router.navigateByUrl("dashboard");
      }
      if (!result.user.complete) {
        this.router.navigateByUrl("complete-profile");
      }
    }, e => {
      if(e.error.statusCode == 400){
        this.msgError = "E-mail ou senha estão incorretos."
      }
      console.log(e);
    });
  }
}
