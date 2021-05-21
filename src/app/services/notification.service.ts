import { User } from './../models/user.model';
import { Observable } from 'rxjs';
import { EmailService } from './email.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from '../../environments/environment';
import { Notification } from '../models/user.model';
import { Email } from '../models/email.model';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class NotificationService {
    constructor(
        private http: HttpClient,
        private emailService: EmailService,
        private socket: Socket
    ) { }

    listNotRead(userID: number) {
        return this.http.get<Notification[]>(`${ENV.API_URL}/notifications/not-read/${userID}`);
    } 

    joinChat(user: number) {
      this.socket.emit('notify', user,  (error) => {
        if (error) {
          console.error(error)
        }
      });
    }

    notify(notification: Notification) {
        const email = new Email(
            {
              replyTo: "",
              subject: 'Notificação na plataforma',
              text: "Tem notificação nova lá na plataforma",
              html: `
                <h3>Notificação</h3>
                <p>${notification.text}</p>
              `
            }
          );

          this.emailService.send(email).subscribe(
            success => console.log('Notificação via email enviada'),
            error => console.error('Erro ao enviar notificação via email')
          );
            
        let id = typeof notification.user === 'number' ? notification.user : notification.user.id;
        
        this.joinChat(id);
        this.socket.emit(
          'sendNotification', 
          notification, 
          (error) => {
            if (error) {
              console.error(error)
            }
          }
        );

        return this.http.post(`${ENV.API_URL}/notifications`, notification);
    }


    updateStatusRead(id: number) {
        return this.http.put<Notification>(`${ENV.API_URL}/notifications/read/${id}`, {});
    }

    getByUser(userId: number):Observable<Notification[]> {
      return this.http.get<Notification[]>(`${ENV.API_URL}/notifications?user=${userId}`);
    }

    getNotifications(): Observable<any> {
      return Observable.create((observer) => {
        this.socket.on('newNotification', (notification) => {
          observer.next(notification);
        });
      });
    }
}