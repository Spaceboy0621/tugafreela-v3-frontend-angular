import { ProposalListCardComponent } from './proposal-list-card/proposal-list-card.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgbNavModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from './../../components/components.module';
import { JobFreelaCardComponent } from './job-freela-card/job-freela-card.component';
import { ListProposalsComponent } from './list-proposals/list-proposals.component';
import { JobClientCardComponent } from './job-client-card/job-client-card.component';
import { JobCardProposalComponent } from './job-card-proposal/job-card-proposal.component';
import { SendQuestionComponent } from './send-question/send-question.component';
import { SendProposalComponent } from './send-proposal/send-proposal.component';
import { NewJobComponent } from './new-job/new-job.component';
import { MyJobsComponent } from './my-jobs/my-jobs.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { EditProposalComponent } from './edit-proposal/edit-proposal.component';
import { EditJobComponent } from './edit-job/edit-job.component';
import { DisputeComponent } from './dispute/dispute.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectTypeProjectComponent } from './select-type-project/select-type-project.component';



@NgModule({
  declarations: [
    DisputeComponent,
    EditJobComponent,
    EditProposalComponent,
    JobDetailsComponent,
    MyJobsComponent,
    NewJobComponent,
    SendProposalComponent,
    SendQuestionComponent,
    JobCardProposalComponent,
    JobClientCardComponent,
    JobFreelaCardComponent,
    ListProposalsComponent,
    ProposalListCardComponent,
    SelectTypeProjectComponent
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
    ModalModule.forChild()
  ],
  exports: [
    JobCardProposalComponent,
    JobClientCardComponent,
    JobFreelaCardComponent,
    ListProposalsComponent,
    JobCardProposalComponent
  ]
})
export class JobsModule { }
