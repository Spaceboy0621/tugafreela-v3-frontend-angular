import { NgbNavModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OwnerComponent } from './owner/owner.component';
import { MessageComponent } from './message/message.component';
import { LoaderComponent } from './loader/loader.component';
import { HeaderComponent } from './header/header.component';
import { FreelaInfoComponent } from './freela-info/freela-info.component';
import { Footer2Component } from './footer2/footer2.component';
import { FooterComponent } from './footer/footer.component';
import { ChatComponent } from './chat/chat.component';
import { CategoriesComponent } from './categories/categories.component';
import { AllNotificationsComponent } from './all-notifications/all-notifications.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';
import { ModalNewDeadlineComponent } from './modal-new-deadline/modal-new-deadline.component';
import { AngularEmojisModule } from 'angular-emojis';
import { ModalDefaultComponent } from './modal-default/modal-default.component';



@NgModule({
  declarations: [
    AllNotificationsComponent,
    CategoriesComponent,
    ChatComponent,
    FooterComponent,
    Footer2Component,
    FreelaInfoComponent,
    HeaderComponent,
    LoaderComponent,
    MessageComponent,
    OwnerComponent,
    ModalConfirmComponent,
    ModalNewDeadlineComponent,
    ModalDefaultComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AngularMultiSelectModule,
    NgbNavModule,
    AngularEmojisModule,
    NgbModule
  ],
  exports: [
    AllNotificationsComponent,
    CategoriesComponent,
    ChatComponent,
    FooterComponent,
    Footer2Component,
    FreelaInfoComponent,
    HeaderComponent,
    LoaderComponent,
    MessageComponent,
    OwnerComponent,
    NgbModule,
    ReactiveFormsModule,
    ModalConfirmComponent,
    ModalNewDeadlineComponent,
    ModalDefaultComponent
  ]
})
export class ComponentsModule { }
