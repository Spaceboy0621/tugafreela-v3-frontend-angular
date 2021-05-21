import { Job } from './job.model';
import { User } from './user.model';

export class Question {

    public constructor(init?: any) {
        Object.assign(this, init);
    }

    id: number;
    question: string;
    job: Job;
    freelancer: User;
}