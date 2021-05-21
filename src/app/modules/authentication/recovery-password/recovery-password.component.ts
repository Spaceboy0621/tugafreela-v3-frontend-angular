import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.scss']
})
export class RecoveryPasswordComponent implements OnInit {
  sendEmail: boolean = false;
  formPassword: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.formPassword = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
    });
  }

  recovery() {
    this.authService.recoverPassword(this.formPassword.value).subscribe((result) => {
      this.sendEmail = true;
      console.log(result);
    }, e => {
      // if(e.error.statusCode == 400){
      //   this.msgError = "E-mail ou senha estão incorretos."
      // }
      console.log(e);
    });
  }
}
