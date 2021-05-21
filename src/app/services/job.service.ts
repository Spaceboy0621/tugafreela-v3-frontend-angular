import { ProjectViewsModel } from './../models/project-views.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Job } from '../models/job.model';
import { ENV } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable()
export class JobService {
    constructor(private http: HttpClient) { }
    
    create(job: Job) {
        return this.http.post<Job>(`${ENV.API_URL}/jobs`, job);
    }

    update(id: number, job: Job) {
        return this.http.put<Job>(`${ENV.API_URL}/jobs/${id}`, job);
    }

    myJobs(user: User) {
        return this.http.get<Job[]>(`${ENV.API_URL}/jobs/my-jobs/${user.id}/${user.type}`);
    }

    details(jobID: number) {
        return this.http.get<Job>(`${ENV.API_URL}/jobs/${jobID}`);
    }

    search(filters: any) {
        return this.http.post<Job[]>(`${ENV.API_URL}/jobs/search`, filters);
    }

    getByStatus(status: string) {
        return this.http.get<Job[]>(`${ENV.API_URL}/jobs/status/${status}`);
    }

    getByName(name: string) {
        return this.http.get<Job[]>(`${ENV.API_URL}/jobs/name/${name}`);
    }

    getByOwner(owner: string) {
        return this.http.get<Job[]>(`${ENV.API_URL}/jobs/owner/${owner}`);
    }

    getById(id: number) {
        return this.http.get<Job>(`${ENV.API_URL}/jobs/${id}`);
    }

    getJobViews(id: number) {
        return this.http.get<ProjectViewsModel[]>(`${ENV.API_URL}/project-views?job=${id}`);
    }
    
    saveJobView(job: number, viewer: number) {
        return this.http.post<ProjectViewsModel>(`${ENV.API_URL}/project-views`, {job, viewer});
    }
}