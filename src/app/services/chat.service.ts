import { ChatMessagesModel } from './../models/chat-messages.model';
import { ChatModel } from './../models/chat.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../environments/environment';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  
  createChat(chat: ChatModel) {
    return this.http.post<ChatModel>(`${ENV.API_URL}/chats`, chat);
  }

  getById(id: number) {
    return this.http.get<ChatModel>(`${ENV.API_URL}/chats/${id}`);
  }

  getByJob(id: number){
    return this.http.get<ChatModel[]>(`${ENV.API_URL}/chats?job.id=${id}`);
  }

  getChatsByParticipant1(id: number) {
    return this.http.get<ChatModel[]>(`${ENV.API_URL}/chats?participant1=${id}`);
  }

  getChatsByParticipant2(id: number) {
    return this.http.get<ChatModel[]>(`${ENV.API_URL}/chats?participant2=${id}`);
  }

  sendMessage(message: ChatMessagesModel): Observable<ChatMessagesModel> {
    return this.http.post<ChatMessagesModel>(`${ENV.API_URL}/chat-messages`, message);
  }

  updateMessage(message: ChatMessagesModel): Observable<ChatMessagesModel> {
    return this.http.put<ChatMessagesModel>(`${ENV.API_URL}/chat-messages/${message.id}`, message);
  }

  updateStatusRead(id: number) {
    return this.http.put(`${ENV.API_URL}/chat-messages/status/${id}`, {});
  }

  getMessagesNotRead(id: number) {
    return this.http.get<ChatMessagesModel[]>(`${ENV.API_URL}/chat-messages?receiver.id=${id}`);
  }

  getMessages() {
    return Observable.create((observer) => {
      this.socket.on('newMessage', (message) => {
        observer.next(message);
      });
    });
  }
}
