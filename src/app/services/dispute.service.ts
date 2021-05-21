import { Dispute, DisputeMessages, DisputeMessagesModerator } from './../models/dispute.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable()
export class DisputeService {
    constructor(private http: HttpClient) { }
    
    create(dispute: Dispute) {
        return this.http.post<Dispute>(`${ENV.API_URL}/disputes`, dispute);
    }

    getById(id: number) {
        return this.http.get<Dispute>(`${ENV.API_URL}/disputes/${id}`);
    }
    
    update(id: number, dispute: Dispute) {
        return this.http.put(`${ENV.API_URL}/disputes/${id}`, dispute);
    }

    sendMessage(message: DisputeMessages) {
        return this.http.post<DisputeMessages>(`${ENV.API_URL}/dispute-messages`, message);
    }

    sendMessageModerator(message: DisputeMessagesModerator) {
        return this.http.post<DisputeMessagesModerator>(`${ENV.API_URL}/dispute-messages-moderators`, message);
    }
    
    updateMessageModerator(message: DisputeMessagesModerator) {
        return this.http.put<DisputeMessagesModerator>(`${ENV.API_URL}/dispute-messages-moderators/${message.id}`, message);
    }
  
}
