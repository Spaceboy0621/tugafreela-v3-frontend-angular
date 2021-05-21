import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from '../../environments/environment';
import { Category } from '../models/category.model';

@Injectable()
export class CategoriesService {

  constructor(private http: HttpClient) { }

  get() {
    return this.http.get<Category[]>(`${ENV.API_URL}/categories`);
  }

  getById(id: number) {
    return this.http.get<Category>(`${ENV.API_URL}/categories/${id}`);
  }
}
