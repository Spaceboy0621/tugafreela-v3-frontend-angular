import { Dispute } from './dispute.model';
import { Proposal } from './propsal.model';
import { Category } from './category.model';
import { Skill } from './skill.model';
import { Notification, User } from './user.model';

export class Job {

    public constructor(init?: any) {
        Object.assign(this, init);
    }

    
    id: number;
    title: string;
    categories: Category[];
    description: string;
    files_attached: any[] = [];
    skills: Skill[];
    level_experience: number;
    type: string;
    status: string;
    owner: User;
    freelancer: User;
    created_at: any;
    messages: any[];
    notifications: Notification[];
    proposals: Proposal[];
    deadline: Date;
    client_rated: boolean;
    freela_rated: boolean;
    agreed_value: number;
    dispute: Dispute | number;
    valueJob: number;
    new_deadline: Date;
    date_concluded_by_freela: Date;
    hours: number;
    valueHour: string;
    urgent: boolean;
    featured: boolean;
    viewed?: boolean;
    proposalSent?: boolean;
    paused_in: Date;
    time_paused: number;
    client_spending: number;

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

    getTimeCreated() {
        const one_day = 1000 * 60 * 60 * 24;

        const now = new Date().getTime();
        const created = new Date(this.created_at).getTime();

        const difference = Math.round((now - created) / one_day);

        return difference;
    }

    getTimeCreatedHours() {
        const now = new Date().getTime();
        const created = new Date(this.created_at).getTime();

        const difference = Math.round((now - created) / 1000 / 3600 );
        
        return difference;
    }

    getDeadLineLeftHours() {
        if (!this.deadline) {
            return 0
        }
        const actualDate = new Date();
        const jobDeadline = new Date(this.deadline.toString());
        const diffTime = jobDeadline.getTime() - actualDate.getTime();

        return Math.round((diffTime / 1000 / 3600));
    }

    getDeadLineLeftDays() {
        const one_day = 1000 * 60 * 60 * 24;
        if (!this.deadline) {
            return 0
        }
        const actualDate = new Date();
        const jobDeadline = new Date(this.deadline.toString());
        const diffTime = jobDeadline.getTime() - actualDate.getTime();
        return Math.round((diffTime / one_day));
    }

    getTimeProjectDays() {
        const one_day = 1000 * 60 * 60 * 24;
        if (!this.deadline) {
            return 0
        }
        const actualDate = new Date();
        const jobDeadline = new Date(this.deadline.toString());
        const jobCreated = new Date(this.created_at.toString());

        const diffTime = (jobDeadline.getTime() - jobCreated.getTime());

        return Math.round(diffTime / one_day);
    }

    

    getTimeConcludedByFreela() {
        const actualDate = new Date();
        const concludedByFreelaDate = new Date(this.date_concluded_by_freela.toString());
        const diffTime = actualDate.getTime() - concludedByFreelaDate.getTime();

        return Math.round((diffTime / 1000 / 3600));
    }

    getPausedTimeHours() {
        const actualDate = new Date();
        const jobPausedTime = new Date(this.paused_in.toString());
        const diffTime = jobPausedTime.getTime() - actualDate.getTime();

        return Math.abs(Math.round((diffTime / 1000 / 3600)));
    }
}

