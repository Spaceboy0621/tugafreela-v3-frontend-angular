import { JobService } from '../../services/job.service';
import { Router } from '@angular/router';
import { RunToastUtil } from '../../utils/run-toast.util';
import { NotificationService } from '../../services/notification.service';
import { User, Notification } from '../../models/user.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-notifications',
  templateUrl: './all-notifications.component.html',
  styleUrls: ['./all-notifications.component.scss']
})
export class AllNotificationsComponent implements OnInit {

  userLogged: User;
  notifications: Notification[];
  ready: boolean = false;
  limit: number = 50;

  constructor(
    private notificationService: NotificationService,
    private runToastUtil: RunToastUtil,
    private router: Router,
    private jobService: JobService
  ) { }

  ngOnInit(): void {
    this.userLogged = JSON.parse(localStorage.getItem('user'));
    
    this.getNotifications();
  }

  getNotifications() {
    this.notificationService.getByUser(this.userLogged.id).subscribe(
      success => {
        this.notifications = success;

        for (const [index, item] of this.notifications.entries()) {
          let id = typeof item.job === 'number' ? item.job : item.job.id;

          this.jobService.getById(id).subscribe(
            success => {
              this.notifications[index].job = success;
            },
            error => {
              console.error(['Erro ao recuperar dados do job da notificação', error])
            }
          );
        }

        this.ready = true;
      },
      error => {
        this.runToastUtil.error(2000, 'Erro ao obter notificações para o usuário');
        console.error(['Erro ao obter notificações para o usuário', error]);
      }
    )
  }


  goToLink(link: string) {
    this.router.navigateByUrl(link);
  }

  changeLimit() {
    
  }

}
