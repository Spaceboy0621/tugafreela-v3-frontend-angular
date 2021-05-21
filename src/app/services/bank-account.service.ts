import { BankAccount } from './../models/bank-account.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BankAccountService {

  constructor(
    private http: HttpClient
  ) { }

  create(bank_account: BankAccount) {
    return this.http.post<BankAccount>(`${ENV.API_URL}/bank-accounts`, bank_account);
}

  getById(id: number) {
      return this.http.get<BankAccount>(`${ENV.API_URL}/bank-accounts/${id}`);
  }

  getAll(){
    return this.http.get<BankAccount[]>(`${ENV.API_URL}/bank-accounts`);
  }

  update(id: number, bank_account: BankAccount) {
      return this.http.put(`${ENV.API_URL}/bank-accounts/${id}`, bank_account);
  }

  delete(id: number) {
    return this.http.delete(`${ENV.API_URL}/bank-accounts/${id}`);
  }

  getByUser(id: number) {
    return this.http.get<BankAccount[]>(`${ENV.API_URL}/bank-accounts?owner=${id}`)
  }
}
