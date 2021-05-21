import { JobsModule } from './../jobs/jobs.module';
import { NgbNavModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from './../../components/components.module';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { RatingComponent } from './rating/rating.component';
import { PublicProfileComponent } from './public-profile/public-profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyLevelComponent } from './buy-level/buy-level.component';



@NgModule({
  declarations: [
    DashboardComponent,
    EditProfileComponent,
    PublicProfileComponent,
    RatingComponent,
    MyProfileComponent,
    BuyLevelComponent
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
    JobsModule
  ]
})
export class UserModule { }
