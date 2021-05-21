import { UploadService } from './../services/upload.service';
import { ENV } from '../../environments/environment';
import { Category } from './category.model';
import { Job } from './job.model';
import { Skill } from './skill.model';

export class User {
    public constructor(
        init?: any,
        
    ) {
        Object.assign(this, init);
    }

    id: number;
    name: string;
    nick: string;
    nif: number;
    username: string;
    email: string;
    password: string;
    type: any;
    hour_value: any;
    photo: any;
    professional_description: string;
    about: string;
    experience: string;
    confirmed: boolean;
    categories: Category[];
    skills: Skill[];
    ratings: Rating[];
    blocked: boolean;
    level: number;
    freelancer_earning: number;
    client_spending: number;
    premium: boolean;
    complete: boolean;
    averageRating?: Array<number>;
    accountStatus: string;
    first_buy_level: Date;
    quantity_buy_level: number;
    payment_verified: boolean;
    views: number;

    getMediaRating() {
        if(!this.ratings || this.ratings.length == 0)
            return 0;
            
        const total = this.ratings.map(r => r.rating).reduce( (a, b) => a + b);
        const rating = total / this.ratings?.length;
        
        return Math.round(rating);
    }

    isFreela() {
        return this.type === 'Freelancer';
    }

    getPhoto(format?: string) {
        if(this.photo && this.photo.name && this.photo.formats)  {
            if(format === 'medium') return `${ENV.API_URL}${this.photo.formats.medium.url}`;

            if (this.photo.formats.small) return `${ENV.API_URL}${this.photo.formats.small.url}`;

            return `${ENV.API_URL}${this.photo.url}`

        }

        if (this.photo.url) {
            return `${ENV.API_URL}${this.photo.url}`
        }

        return 'assets/img/profile.png';
    }

    getProfileViews() {
        return this.views;
    }

}

export class Rating {
    
    public constructor(init?: any) {
        Object.assign(this, init);
    }

    id: number;
    rating: number;
    user: User;
    valuer: User;
    comment: string;
    job: Job;
    averageRating?: Array<number>;
}

export class AuthResponse {
    jwt: string;
    user: User;
}

export class Notification{
    public constructor(init?: any) {
        Object.assign(this, init);
    }

    id: number;
    job: Job | number;
    user: User | number;
    text: string;
    read: boolean;
    created_at: any;
    date_reading: Date;
    link: string;

    getDate() {
        const one_day = 1000 * 60 * 60 * 24;

        const now = new Date().getTime();
        const created = new Date(this.created_at).getTime();

        const difference = Math.round((now - created) / one_day);
        if(difference == 0)
            return `hoje mesmo`;

        else if(difference == 1)
            return `há 1 dia`;

        else
            return `há ${difference} dias`;

    }
}