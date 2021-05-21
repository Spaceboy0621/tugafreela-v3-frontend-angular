import { NgbNavModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from './../../components/components.module';
import { SearchJobComponent } from './search-job/search-job.component';
import { SearchFreelaComponent } from './search-freela/search-freela.component';
import { UseTermsComponent } from './use-terms/use-terms.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { HowWorksComponent } from './how-works/how-works.component';
import { HomeComponent } from './home/home.component';
import { FaqComponent } from './faq/faq.component';
import { ContactComponent } from './contact/contact.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    ContactComponent,
    FaqComponent,
    HomeComponent,
    HowWorksComponent,
    PrivacyPolicyComponent,
    UseTermsComponent,
    SearchFreelaComponent,
    SearchJobComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    RouterModule,
    FormsModule,
    AngularMultiSelectModule,
    NgbNavModule,
    NgbModule,
    ReactiveFormsModule
  ]
})
export class LandingModule { }
