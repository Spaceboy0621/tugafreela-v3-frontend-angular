import { BankAccount } from '../../../models/bank-account.model';
import { BankAccountService } from '../../../services/bank-account.service';
import { User } from '../../../models/user.model';
import { ValidateUtil } from '../../../utils/validate.util';
import { FormBuilder } from '@angular/forms';
import { CreditCardModel } from '../../../models/credit-card.model';
import { CreditCardService } from '../../../services/credit-card.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-financial-page',
  templateUrl: './financial-page.component.html',
  styleUrls: ['./financial-page.component.scss']
})
export class FinancialPageComponent implements OnInit {
  
  credit_cards: CreditCardModel[] = [];
  bank_accounts: BankAccount[] = [];

  ready: boolean;
  user: User;

  addOrEditCard: string = '';
  creditCardToEdit: CreditCardModel;

  addOrEditBankAccount: string = '';
  bankAccountToEdit: BankAccount;

  active: string = sessionStorage.getItem('activeTab') ? sessionStorage.getItem('activeTab') : 'cards';

  constructor(
    private creditCardService: CreditCardService,
    private fb: FormBuilder,
    private validateUtil: ValidateUtil,
    private bankAccountService: BankAccountService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getBankAccounts();
  }

  getCreditCards() {
    this.creditCardService.getByUser(this.user.id).subscribe(
      success => {
        this.credit_cards = success;
        this.ready = true;
      }, 
      error => {
        console.error(['Erro ao recuperar dados do cartão', error])
      }
    )
  }

  getBankAccounts() {
    this.bankAccountService.getByUser(this.user.id).subscribe(
      success => {
        this.bank_accounts = success;
        this.getCreditCards();
      },
      error => {
        console.error(['Erro ao recuperar dados da conta bancária', error])
      }
    )
  }

  deleteBankAccount() {

  }

  setBankTabActive(event) {
    sessionStorage.setItem('activeTab', event);

    location.reload();
  }


  editCard(event: CreditCardModel) {
    this.creditCardToEdit = event;
    this.addOrEditCard = 'update';

  }

  addCard() {
    this.addOrEditCard = 'add';
  }

  editBankAccount(event: BankAccount) {
    this.bankAccountToEdit = event;
    this.addOrEditBankAccount = 'update';
  }

  addBankAccount() {
    this.addOrEditBankAccount = 'add';
  }

}
