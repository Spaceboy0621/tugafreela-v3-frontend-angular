import { Observable } from 'rxjs';
import { ENV } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Question } from '../models/questions.model';

@Injectable()
export class QuestionService {
    constructor(private http: HttpClient) { }

    new(question: Question) {
        return this.http.post(`${ENV.API_URL}/questions`, question);
    }

    list() {
        return this.http.get<Question[]>(`${ENV.API_URL}/questions`);
    }
}