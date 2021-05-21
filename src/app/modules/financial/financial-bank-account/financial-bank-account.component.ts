import { RunToastUtil } from './../../../utils/run-toast.util';
import { UserService } from './../../../services/user.service';
import { User } from '../../../models/user.model';
import { BankAccount } from '../../../models/bank-account.model';
import { ValidateUtil } from '../../../utils/validate.util';
import { BankAccountService } from '../../../services/bank-account.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-financial-bank-account',
  templateUrl: './financial-bank-account.component.html',
  styleUrls: ['./financial-bank-account.component.scss']
})
export class FinancialBankAccountComponent implements OnInit {

  @Input() bank_account: BankAccount;
  @Input() page: string = 'financial';
  @Output() editAccountEvent = new EventEmitter();

  user: User;
  typeForm: string;
  ready: boolean = false;

  numberToShow: string = '';

  constructor(
    private userService: UserService,
    private bankAccountService: BankAccountService,
    private runToastUtil: RunToastUtil
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.numberToShow = '**** **** **** ' + this.bank_account.iban.substr((this.bank_account.iban.length - 4));


    const id = typeof this.bank_account.owner === 'number' ? this.bank_account.owner : this.bank_account.owner.id;

    this.userService.getById(id).subscribe(
      success => {
        this.bank_account.owner = new User(success);
        this.ready = true;
      },
      error => {
        console.error(['Erro ao recuperar dados do dono do cartão', error]);
      }
    )
  }

  editAccount() {
    this.editAccountEvent.emit(this.bank_account);
  }

  verify() {
    this.bank_account.checked = true;

    this.bankAccountService.update(this.bank_account.id, this.bank_account).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Conta Bancária verificada com sucesso');
      },
      error => {
        console.error(['Erro ao atualizar conta bancária', error])
      }
    )
  }

  setAsPrimary(event) {
    const target = event.target as HTMLInputElement;

    this.bankAccountService.getByUser(this.user.id).subscribe(
      success => {
        success = success.filter(item => item.primary);
        if (success.length > 0) {
          success[0].primary = false;
          this.bankAccountService.update(success[0].id, success[0]).subscribe(
            success => {
              this.setNewPrimary(Number(target.value));
            }
          );
        }
        else if(success.length === 0) {
          this.setNewPrimary(Number(target.value));
        }
      },
      error => {
        console.error(['Erro ao obter contas do usuário', error])
      }
    )
  }

  setNewPrimary(id: number) {
    this.bank_account.primary = true;

    this.bankAccountService.update(id, this.bank_account).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Conta definida como principal');
        scrollTo(0,0);
      },
      error => {
        console.error(['Erro ao atualizar conta como principal', error])
      }
    );
  }
}
