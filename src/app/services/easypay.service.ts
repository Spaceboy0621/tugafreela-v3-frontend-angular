import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SubscriptionPaymentModel } from './../models/subscription-payment.model';
import { SinglePaymentModel } from './../models/single-payment.model';
import { Injectable } from '@angular/core';
import { ENV } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EasypayService {

  headers = new HttpHeaders({
    'accountId': ENV.easypay.id,
    'apiKey': ENV.easypay.key
  });

  constructor(
    private http: HttpClient
  ) { }

  createSinglePayment(model: SinglePaymentModel) {
    return this.http.post(`${ENV.easypay.url}/single`, model, { headers: this.headers });
  }

  createSubscriptionPayment(model: SubscriptionPaymentModel) {
    return this.http.post(`${ENV.easypay.url}/subscription`, model, { headers: this.headers });
  }


  uniqueDetailsSingle(id: string) {
    return this.http.get(`${ENV.easypay.url}/single/${id}`);
  }

  uniqueDetailsSub(id: string) {
    return this.http.get(`${ENV.easypay.url}/subscription/${id}`);
  }
}
