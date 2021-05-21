import { Router } from '@angular/router';
import { RunToastUtil } from './../../../utils/run-toast.util';
import { User } from './../../../models/user.model';
import { UserService } from './../../../services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {

  user: User;
  modalCancel: boolean = false;
  
  constructor(
    private userService: UserService,
    private runToastUtil: RunToastUtil,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
     
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if (
        this.modalCancel
        && !target.classList.contains('modal-confirm') 
        && !target.classList.contains('title') 
        && !target.classList.contains('text')
        && !target.classList.contains('btn-cancel')
        && !target.classList.contains('btn-red')
      ) {
        this.modalCancel = false;
      }
    });
  }


  cancelPlan(event) {
    // Implementar Stripe

    this.user.premium = false;
    localStorage.setItem('user', JSON.stringify(this.user));
    this.userService.update(this.user).subscribe(
      success => {
        this.runToastUtil.success(2000, 'Plano cancelado com sucesso');
        this.modalCancel = false;
      },
      error => {
        console.error(['Erro ao atualizar usuário', error])
      }
    )
  }

  buyPlan() {
    const item = 'Plano Premium Pacote Mensal';
    const price = 15;
    const type = 'premium';
    this.router.navigateByUrl(`/checkout/${item}/${price}/${type}`);

  }
}
