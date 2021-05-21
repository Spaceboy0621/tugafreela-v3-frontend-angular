import { LevelRules } from './../models/level-rules.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../environments/environment';

@Injectable()
export class LevelRulesService {
    constructor(private http: HttpClient) { }

    getRulesByType(type: string): Observable<LevelRules[]> {
        return this.http.get<LevelRules[]>(`${ENV.API_URL}/level-rules?user_type=${type}`);
    }

   
}