import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class DateUtilsService {
    constructor() { }
    
    getDiferenceDays(date) {
        const one_day = 1000 * 60 * 60 * 24;

        const now = new Date().getTime();
        const created = new Date(date).getTime();

        const difference = Math.round((now - created) / one_day);
        if(difference == 0)
            return `hoje mesmo`;

        else if(difference == 1)
            return `ontem`;

        else
            return `há ${difference} dias`;

    }
}