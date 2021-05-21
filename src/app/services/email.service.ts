import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http: HttpClient) { }


  send(email: any) {
    return this.http.post<any>(`${ENV.API_URL}/email/`, email);
  }

}
