import { Rating } from './../models/user.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable()
export class UserService {
    constructor(private http: HttpClient) { }

    loadProfile() {
        return this.http.get<any>(`${ENV.API_URL}/anys/1`);
    }

    updateProfile(any: any) {
        return this.http.put<any>(`${ENV.API_URL}/anys/${any.id}`, any);
    }

    update(user: User) {
        return this.http.put<any>(`${ENV.API_URL}/users/${user.id}`, user);
    }
    
    uploadPhoto(form: FormData) {
        return this.http.post(`${ENV.API_URL}/upload`, form, { headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("token")
        }});
    }

    deletePhoto(idPhoto: number) {
        return this.http.delete(`${ENV.API_URL}/upload/files/${idPhoto}`);
    }

    search(filters: any) {
        return this.http.post<User[]>(`${ENV.API_URL}/users/search`, filters);
    }
  
    getById(id: number):Observable<User> {
        return this.http.get<User>(`${ENV.API_URL}/users/${id}`);
    }

    getAll():Observable<User[]> {
        return this.http.get<User[]>(`${ENV.API_URL}/users`);
    }

    rateUser(rating: Rating) {
        return this.http.post(`${ENV.API_URL}/ratings/`, rating);
    }

    getFeedbacks(user: User) {
        return this.http.get<Rating[]>(`${ENV.API_URL}/ratings/feedback/${user.id}`);
    }

    addNewView(user: User) {
        user.views += 1;
        return this.http.put(`${ENV.API_URL}/users/${user.id}`, user);
    }
}