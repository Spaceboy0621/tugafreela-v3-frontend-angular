import { RunToastUtil } from './../../../utils/run-toast.util';
import { User } from './../../../models/user.model';
import { UserService } from './../../../services/user.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-buy-level',
  templateUrl: './buy-level.component.html',
  styleUrls: ['./buy-level.component.scss']
})
export class BuyLevelComponent implements OnInit {

  user: User;

  constructor(
    private router: Router,
    private userService: UserService,
    private runToastUtil: RunToastUtil
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  gotToCheckout() {

    const date = new Date().getTime();
    const timeDiff = date - new Date(this.user.first_buy_level).getTime();

    const yearDiff = timeDiff / (3600 * 1000 * 24 * 365);

    if (yearDiff <= 1 && this.user.quantity_buy_level >= 3) {
      this.runToastUtil.error(2000, 'Só é possível comprar 3 pacotes de nível por ano');
      return;
    }

   if (yearDiff > 1 && this.user.quantity_buy_level > 0) {
     this.user.quantity_buy_level = 0;
   }

    const item = 'Pacote de nível';
    const price = 55;
    const type = 'level';
    this.router.navigateByUrl(`/checkout/${item}/${price}/${type}`);

  }
}
