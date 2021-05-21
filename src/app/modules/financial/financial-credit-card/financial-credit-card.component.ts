import { Router } from '@angular/router';
import { UserService } from './../../../services/user.service';
import { RunToastUtil } from './../../../utils/run-toast.util';
import { StripeChargeService } from './../../../services/stripe-charge.service';
import { StripeChargeModel } from './../../../models/stripe-charge.model';
import { ValidateUtil } from '../../../utils/validate.util';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreditCardService } from '../../../services/credit-card.service';
import { CreditCardModel } from '../../../models/credit-card.model';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-financial-credit-card',
  templateUrl: './financial-credit-card.component.html',
  styleUrls: ['./financial-credit-card.component.scss']
})
export class FinancialCreditCardComponent implements OnInit {

  @Input() credit_card: CreditCardModel;
  @Input() page: string = 'financial';
  @Output() selectedEvent = new EventEmitter();
  @Output() editCardEvent = new EventEmitter();

  numberToShow: string;
  formCreditCard: FormGroup;

  cpfInvalid: boolean;
  numberInvalid: boolean;
  cvvInvalid: boolean;

  constructor(
    private creditCardService: CreditCardService,
    private fb: FormBuilder,
    private validateUtil: ValidateUtil,
    private stripeChargeService: StripeChargeService,
    private runToastUtil: RunToastUtil,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.numberToShow = '**** **** **** ' + this.credit_card.number.substr((this.credit_card.number.length - 4));
  }

  selectCard() {
    
    this.selectedEvent.emit(this.credit_card.id);
  }

  editCard() {
    this.editCardEvent.emit(this.credit_card);
  }

  deleteCard() {
    const conf = confirm('Tem certeza que deseja excluir o cartão? A ação não poderá ser revertida');

    if (conf) {
      this.creditCardService.delete(this.credit_card.id).subscribe(
        success => {
          alert('Cartão excluido com sucesso');
          location.reload();
        },
        error => {
          alert('Erro ao excluir cartão');
          console.error(['Erro ao excluir cartão', error])
        }
      )
    }
  }


  charge() {
    if (this.credit_card.checked) {
      return;
    }

    const charge = new StripeChargeModel({
      "id": "",
      "object": "charge",
      "amount": 10,
      "amount_captured": 0,
      "amount_refunded": 0,
      "application": null,
      "application_fee": null,
      "application_fee_amount": null,
      "balance_transaction": "",
      "billing_details": {
        "address": {
          "city": null,
          "country": null,
          "line1": null,
          "line2": null,
          "postal_code": null,
          "state": null
        },
        "email": null,
        "name": this.credit_card.name_on_the_card,
        "phone": null
      },
      "calculated_statement_descriptor": null,
      "captured": true,
      "created": new Date().getTime(),
      "currency": "eur",
      "customer": null,
      "description": "Validação de cartão de crédito no ato do cadastro",
      "disputed": false,
      "failure_code": null,
      "failure_message": null,
      "fraud_details": {},
      "invoice": null,
      "livemode": false,
      "metadata": {},
      "on_behalf_of": null,
      "order": null,
      "outcome": null,
      "paid": true,
      "payment_intent": null,
      "payment_method": "card_19yUNL2eZvKYlo2CNGsN6EWH",
      "payment_method_details": {
        "card": {
          "brand": this.credit_card.flag,
          "checks": {
            "address_line1_check": null,
            "address_postal_code_check": null,
            "cvc_check": "unchecked"
          },
          "country": "PT",
          "exp_month": Number(this.credit_card.expiration_date_month),
          "exp_year": Number(this.credit_card.expiration_date_year),
          "fingerprint": "Xt5EWLLDS7FJjR1c",
          "funding": "credit",
          "installments": null,
          "last4": this.credit_card.number.substr((this.credit_card.number.length - 3)),
          "network": this.credit_card.flag,
          "three_d_secure": null,
          "wallet": null
        },
        "type": "card"
      },
      "receipt_email": null,
      "receipt_number": null,
      "receipt_url": "https://pay.stripe.com/receipts/acct_1032D82eZvKYlo2C/ch_1If01e2eZvKYlo2C9MsMQd21/rcpt_JHZ9YbXe2lgZfWdv4W5GsRWCl804htb",
      "refunded": false,
      "refunds": {
        "object": "list",
        "data": [],
        "has_more": false,
        "url": "/v1/charges/ch_1If01e2eZvKYlo2C9MsMQd21/refunds"
      },
      "review": null,
      "shipping": null,
      "source_transfer": null,
      "statement_descriptor": null,
      "statement_descriptor_suffix": null,
      "status": "",
      "transfer_data": null,
      "transfer_group": null
    }); 

    // Implementar Stripe
    this.credit_card.checked = true;
    
    this.creditCardService.update(this.credit_card.id, this.credit_card).subscribe(
      success => {
        this.runToastUtil.success(2000, `Cartão '${this.credit_card.surname}' validado com sucesso` );
        let id = typeof this.credit_card.card_owner === 'number' ? this.credit_card.card_owner : this.credit_card.card_owner.id;

        this.userService.getById(id).subscribe(
          success => {
            if (!success.payment_verified) {
              success.payment_verified = true;
              localStorage.setItem('user', JSON.stringify(success));
              this.userService.update(success).subscribe(
                sucess => {
                  
                },
                error => {

                }
              );
            }
          },
          error => {
            
          }
        );
      },
      error => {
        console.error(['Erro ao atualzar o cartão', error])
      }
    )
    // this.stripeChargeService.create(charge).subscribe(
    //   success => {
    //     if (success.status === 'succeeded') {
    //       this.runToastUtil.success(2000, `Cartão '${this.credit_card.surname}' validado com sucesso` );
    //       this.credit_card.checked = true;
    //     }
    //   },
    //   error => {
    //     this.runToastUtil.error(2000, `Erro ao validar cartão de crédito  ${this.credit_card.surname}`);
    //     console.error(['Erro ao validar cartão', error])
    //   }
    // );

  }
}
