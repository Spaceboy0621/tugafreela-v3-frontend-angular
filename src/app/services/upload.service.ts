import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../environments/environment';

@Injectable()
export class UploadService {
    constructor(private http: HttpClient) { }
    
    upload(form: FormData) {
        return this.http.post<any>(`${ENV.API_URL}/upload`, form);
    }

    delete(idFile: number) {
        return this.http.delete(`${ENV.API_URL}/upload/files/${idFile}`);
    }

    getById(idFile: number) {
        return this.http.get(`${ENV.API_URL}/upload/files/${idFile}`);
    }

    list() {
        return this.http.get(`${ENV.API_URL}/upload/files`);
    }
}