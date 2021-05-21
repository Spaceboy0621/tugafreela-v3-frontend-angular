import { Job } from './../models/job.model';
import { User } from './../models/user.model';
import { Proposal } from './../models/propsal.model';
import { ENV } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProposalService {
    constructor(private http: HttpClient) { }

    listByJob(jobId: number) {
        return this.http.get<Proposal[]>(`${ENV.API_URL}/proposals/job/${jobId}`);
    }
  
  create(proposal: Proposal) {
    return this.http.post(`${ENV.API_URL}/proposals`, proposal);
  }

  listByFreela(user: User) {
    return this.http.get<Proposal[]>(`${ENV.API_URL}/proposals/user/${user.id}`);
  }

  getByID(id: number) {
    return this.http.get<Proposal>(`${ENV.API_URL}/proposals/${id}`);
  }

  update(proposal: Proposal) {
    return this.http.put(`${ENV.API_URL}/proposals/${proposal.id}`, proposal);
  }

  delete(id: number) {
    return this.http.delete(`${ENV.API_URL}/proposals/${id}`);
  }

  getByJob(job: Job) {
    return this.http.post<Proposal[]>(`${ENV.API_URL}/proposals/job`, job);
  }
}