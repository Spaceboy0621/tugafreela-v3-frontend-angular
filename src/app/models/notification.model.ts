import { Job } from './job.model';
import { User } from './user.model';

export class Notification {

    public constructor(init?: any) {
        Object.assign(this, init);
    }
    
    id: number;
    user: User;
    job: Job;
    text: string;
    read: boolean;
    link: string;
    date_reading: Date;
}