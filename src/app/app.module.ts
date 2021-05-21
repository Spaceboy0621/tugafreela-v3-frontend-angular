import { StripePaymentService } from './services/stripe-payment.service';
import { StripeCustomerService } from './services/stripe-customer.service';
import { StripeChargeService } from './services/stripe-charge.service';
import { EmojisService } from './services/emojis.service';
import { ComponentsModule } from './components/components.module';
import { FinancialModule } from './modules/financial/financial.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { UserModule } from './modules/user/user.module';
import { LandingModule } from './modules/landing/landing.module';
import { LevelRulesService } from './services/level-rules.service';
import { RunToastUtil } from './utils/run-toast.util';
import { ValidateUtil } from './utils/validate.util';
import { DisputeService } from './services/dispute.service';
import { QuestionService } from './services/question.service';
import { ProposalService } from './services/proposal.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './utils/guards/auth.guard';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth.service';
import { CategoriesService } from './services/categories.service';
import { SkillsService } from './services/skills.service';
import { UserService } from './services/user.service';
import { JobService } from './services/job.service';
import { NotificationService } from './services/notification.service';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NgbModule, NgbProgressbarConfig, NgbProgressbarModule, NgbRatingModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from './services/upload.service'
import { registerLocaleData } from '@angular/common'
import localePt from '@angular/common/locales/pt';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ENV } from '../environments/environment';

const config: SocketIoConfig = {url: ENV.API_URL, options: {  }}
registerLocaleData(localePt, 'pt-BR');
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    AngularMultiSelectModule,
    NgbRatingModule,
    NgbToastModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NoopAnimationsModule,
    ModalModule.forRoot(),
    SocketIoModule.forRoot(config),
    NgbModule,
    LandingModule,
    UserModule,
    JobsModule,
    AuthenticationModule,
    FinancialModule,
    ComponentsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pt-BR'},
    
    AuthGuard,
    JobService,
    UserService,
    AuthService,
    SkillsService,
    UploadService,
    CategoriesService,
    NotificationService,
    ProposalService,
    QuestionService,
    DisputeService,
    ValidateUtil,
    RunToastUtil,
    LevelRulesService,
    EmojisService,
    StripeChargeService,
    StripeCustomerService,
    StripePaymentService
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
