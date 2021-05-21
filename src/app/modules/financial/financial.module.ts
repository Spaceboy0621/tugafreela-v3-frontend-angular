import { NgbNavModule, NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from './../../components/components.module';
import { FinancialPageComponent } from './financial-page/financial-page.component';
import { FinancialCreditCardComponent } from './financial-credit-card/financial-credit-card.component';
import { FinancialBankAccountComponent } from './financial-bank-account/financial-bank-account.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { RefundsHistoryComponent } from './refunds-history/refunds-history.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { VerifyPaymentComponent } from './verify-payment/verify-payment.component';
import { PaymentPageComponent } from './payment-page/payment-page.component';
import { FormCreditCardComponent } from './form-credit-card/form-credit-card.component';
import { FormBankAccountComponent } from './form-bank-account/form-bank-account.component';



@NgModule({
  declarations: [
    FinancialBankAccountComponent,
    FinancialCreditCardComponent,
    FinancialPageComponent,
    PaymentHistoryComponent,
    RefundsHistoryComponent,
    SubscriptionsComponent,
    VerifyPaymentComponent,
    PaymentPageComponent,
    FormCreditCardComponent,
    FormBankAccountComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMultiSelectModule,
    NgbNavModule,
    NgbModule,
    ModalModule.forChild(),
    NgbTooltipModule
  ]
})
export class FinancialModule { }
