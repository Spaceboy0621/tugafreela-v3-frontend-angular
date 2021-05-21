import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../environments/environment';
import { Skill } from '../models/skill.model';

@Injectable()
export class SkillsService {
    constructor(private http: HttpClient) { }
    
    getAll() {
        return this.http.get<Skill[]>(`${ENV.API_URL}/skills`);
    }
}