import { PaymentPageComponent } from './modules/financial/payment-page/payment-page.component';
import { AccountCreatedComponent } from './modules/authentication/account-created/account-created.component';
import { AccountConfirmedComponent } from './modules/authentication/account-confirmed/account-confirmed.component';
import { NewJobComponent } from './modules/jobs/new-job/new-job.component';
import { UseTermsComponent } from './modules/landing/use-terms/use-terms.component';
import { SignupComponent } from './modules/authentication/signup/signup.component';
import { SendQuestionComponent } from './modules/jobs/send-question/send-question.component';
import { SendProposalComponent } from './modules/jobs/send-proposal/send-proposal.component';
import { SearchJobComponent } from './modules/landing/search-job/search-job.component';
import { SearchFreelaComponent } from './modules/landing/search-freela/search-freela.component';
import { RecoveryPasswordComponent } from './modules/authentication/recovery-password/recovery-password.component';
import { PrivacyPolicyComponent } from './modules/landing/privacy-policy/privacy-policy.component';
import { NewPasswordComponent } from './modules/authentication/new-password/new-password.component';
import { MyProfileComponent } from './modules/user/my-profile/my-profile.component';
import { MyJobsComponent } from './modules/jobs/my-jobs/my-jobs.component';
import { LoginComponent } from './modules/authentication/login/login.component';
import { JobDetailsComponent } from './modules/jobs/job-details/job-details.component';
import { HowWorksComponent } from './modules/landing/how-works/how-works.component';
import { HomeComponent } from './modules/landing/home/home.component';
import { FaqComponent } from './modules/landing/faq/faq.component';
import { EditProfileComponent } from './modules/user/edit-profile/edit-profile.component';
import { ContactComponent } from './modules/landing/contact/contact.component';
import { EditProposalComponent } from './modules/jobs/edit-proposal/edit-proposal.component';
import { DashboardComponent } from './modules/user/dashboard/dashboard.component';
import { EditJobComponent } from './modules/jobs/edit-job/edit-job.component';
import { ListProposalsComponent } from './modules/jobs/list-proposals/list-proposals.component';
import { RatingComponent } from './modules/user/rating/rating.component';
import { PublicProfileComponent } from './modules/user/public-profile/public-profile.component';
import { DisputeComponent } from './modules/jobs/dispute/dispute.component';
import { ChatComponent } from './components/chat/chat.component';
import { FinancialPageComponent } from './modules/financial/financial-page/financial-page.component';
import { AllNotificationsComponent } from './components/all-notifications/all-notifications.component';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './utils/guards/auth.guard';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'how-works', component: HowWorksComponent},
  {path: 'faq', component: FaqComponent},
  {path: 'use-terms', component: UseTermsComponent},
  {path: 'privacy-policy', component: PrivacyPolicyComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'login', component: LoginComponent},
  {path: 'complete-profile', component: AccountConfirmedComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'signup/created', component: AccountCreatedComponent},
  {path: 'signup/confirmed', component: AccountConfirmedComponent},
  {path: 'signup/:type', component: SignupComponent},
  {path: 'password/recovery', component: RecoveryPasswordComponent},
  {path: 'password/new', component: NewPasswordComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'my-jobs', component: MyJobsComponent, canActivate: [AuthGuard]},
  {path: 'my-jobs/:status', component: MyJobsComponent, canActivate: [AuthGuard]},
  {path: 'me/profile', component: MyProfileComponent, canActivate: [AuthGuard]},
  {path: 'profile/:userID', component: MyProfileComponent},
  {path: 'me/profile/edit', component: EditProfileComponent, canActivate: [AuthGuard]},
  {path: 'search/freela/:category', component: SearchFreelaComponent},
  {path: 'search/freela', component: SearchFreelaComponent},
  {path: 'search/job', component: SearchJobComponent},
  {path: 'job/new', component: NewJobComponent, canActivate: [AuthGuard]},
  {path: 'job/:jobID', component: JobDetailsComponent, canActivate: [AuthGuard]},
  {path: 'job/:jobID/send-proposal', component: SendProposalComponent, canActivate: [AuthGuard]},
  {path: 'job/:jobID/send-question', component: SendQuestionComponent, canActivate: [AuthGuard]},
  {path: 'job/:proposalID/:jobID/edit-proposal', component: EditProposalComponent, canActivate: [AuthGuard]},
  {path: 'job/:jobID/edit-job', component: EditJobComponent, canActivate: [AuthGuard]},
  {path: 'job/:jobID/list-proposals', component: ListProposalsComponent, canActivate: [AuthGuard]},
  {path: 'job/:jobID/rating', component: RatingComponent, canActivate: [AuthGuard]},
  {path: 'dispute/:disputeID', component: DisputeComponent, canActivate: [AuthGuard]},
  {path: 'chats', component: ChatComponent, canActivate: [AuthGuard]},
  {path: 'chats/:chatId', component: ChatComponent, canActivate: [AuthGuard]},
  {path: 'my-financial', component: FinancialPageComponent, canActivate: [AuthGuard]},
  {path: 'all-notifications', component: AllNotificationsComponent, canActivate: [AuthGuard]},
  {path: 'checkout/:item/:price/:type', component: PaymentPageComponent, canActivate: [AuthGuard]},
  {path: 'checkout/:item/:price/:type/:jobId', component: PaymentPageComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
