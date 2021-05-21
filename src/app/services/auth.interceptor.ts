import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authTokent: string = localStorage.getItem("token");
        // CASO NAO ESTEJA LOGADO A REQUISICAO SEGUE SEM O HEADER AUTH
        if(!authTokent)
            return next.handle(httpRequest);

        return next.handle(httpRequest.clone({ setHeaders: { 'Authorization': 'Bearer ' + authTokent } }))
    }
}