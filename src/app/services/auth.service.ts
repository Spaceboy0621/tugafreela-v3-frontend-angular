import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, User } from '../models/user.model';
import { ENV } from '../../environments/environment';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) { }

    auth(loginRQ: any) {
        return this.http.post<AuthResponse>(`${ENV.API_URL}/auth/local`, loginRQ);
    }

    isLogged() {
        return localStorage.getItem("token") != null;
    }

    register(user: User) {
        return this.http.post<AuthResponse>(`${ENV.API_URL}/auth/local/register`, user);
    }

    recoverPassword(email: any) {
        return this.http.post<any>(`${ENV.API_URL}/auth/forgot-password`, email);
    }

    newPassword(password: any) {
        return this.http.post<any>(`${ENV.API_URL}/auth/reset-password`, password);
    }

    sendConfirmPhone(phone: string) {
        const code = window.crypto.getRandomValues(new Uint32Array(10));
        const index = Math.round(Math.random() * 10);
        const finalCode = code[index].toString();
        sessionStorage.setItem('codePhone', finalCode);

        return this.http.post<any>(`${ENV.API_URL}/sender-messages/send`, {code: finalCode, phone});
    }
}