import { Observable } from 'rxjs';
import { StripeChargeModel } from './../models/stripe-charge.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeChargeService {

  url: string = 'https://api.stripe.com/v1/charges';
  headers = new HttpHeaders();

  constructor(
    private http: HttpClient
  ) { }

  create(charge: StripeChargeModel): Observable<StripeChargeModel> {
    this.headers = this.headers.set('authorization', ENV.stripe.auth_header);

    return this.http.post<StripeChargeModel>(`${this.url}`, charge, {headers: this.headers})
  }

  getById(id: string): Observable<StripeChargeModel> {
    return this.http.get<StripeChargeModel>(`${this.url}/${id}`);
  }

  update(id: string, charge: StripeChargeModel): Observable<StripeChargeModel> {
    return this.http.post<StripeChargeModel>(`${this.url}/${id}`, charge);
  }

  //Metodo de pagamentos em duas etapas, quando vc cria um charge ,mas não faz a captura (cobrança)
  capture(id: string, charge: StripeChargeModel): Observable<StripeChargeModel> {
    return this.http.post<StripeChargeModel>(`${this.url}/${id}/capture`, charge);
  }

  list(): Observable<StripeChargeModel> {
    return this.http.get<StripeChargeModel>(`${this.url}`);
  }
}
