import { NgxMaskModule } from 'ngx-mask';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from './../../components/components.module';
import { AccountCreatedComponent } from './account-created/account-created.component';
import { AccountConfirmedComponent } from './account-confirmed/account-confirmed.component';
import { SignupComponent } from './signup/signup.component';
import { RecoveryPasswordComponent } from './recovery-password/recovery-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    LoginComponent,
    NewPasswordComponent,
    RecoveryPasswordComponent,
    SignupComponent,
    AccountConfirmedComponent,
    AccountCreatedComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    RouterModule,
    FormsModule,
    AngularMultiSelectModule,
    NgbNavModule,
    NgbModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot()
  ]
})
export class AuthenticationModule { }
