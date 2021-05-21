import { User } from './user.model';
import { Job } from 'src/app/models/job.model';
export class Proposal {

    public constructor(init?: any) {
        Object.assign(this, init);
    }
    
    id: number;
    description: string;
    freelancer: User;
    value: number;
    average_time: number;
    term: number;
    job: Job;
    created_at: Date;
    status: string;
    color?: string;
}