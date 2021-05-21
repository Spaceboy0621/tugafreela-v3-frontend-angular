import { Job } from 'src/app/models/job.model';
import { JobService } from './../../../services/job.service';
import { RunToastUtil } from './../../../utils/run-toast.util';
import { UserService } from './../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from './../../../models/user.model';
import { CreditCardModel } from './../../../models/credit-card.model';
import { CreditCardService } from './../../../services/credit-card.service';
import { Component, Input, OnInit } from '@angular/core';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.scss']
})
export class PaymentPageComponent implements OnInit {

  credit_cards: CreditCardModel[];
  ready: boolean = false;
  user: User;
  paymentSelected: any;

  item: string = '';
  price: number = 0;
  type: string = '';
  jobId: number = 0;
  

  constructor(
    private creditCardService: CreditCardService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private runToastUtil: RunToastUtil,
    private jobService: JobService
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.route.params.subscribe(
      params => {
        this.item = params['item'];
        this.price = params['price']
        this.type = params['type']
        if (params['jobId']) {
          this.jobId = params['jobId'];
        }
      }
    )
    this.getCreditCards();
  }

  getCreditCards() {
    this.creditCardService.getByUser(this.user.id).subscribe(
      success => {
        this.credit_cards = success;
        // this.credit_cards = this.credit_cards.filter(item => item.checked);
        this.ready = true;
      }, 
      error => {
        console.error(['Erro ao recuperar dados do cartão', error])
      }
    )
  }

  selectPayment(event) {
    const card = this.credit_cards.filter(item => item.id === event);
    this.paymentSelected = card[0];
    console.log(this.paymentSelected);
  }

  pay() {
    
    if(!this.paymentSelected) {
      this.runToastUtil.error(2000, 'Selecione um meio de pagamento');
      return;
    }
    //Implementar Stripe
    //Aplicar lógica de pagamento

    //Compra de nível
    if (this.type === 'level') {
      this.user.level += 3;
      this.user.first_buy_level = new Date();
      this.user.quantity_buy_level += 1;
     
      this.userService.update(this.user).subscribe(
        success => {
          localStorage.setItem('user', JSON.stringify(this.user));
          this.runToastUtil.success(2000, 'Parabéns! Você comprou 3 níveis com sucesso');
          setTimeout(() => {
            this.router.navigateByUrl('/dashboard');
          }, 2000);
        },
        error => {
          console.error(['Erro ao atualizar nível do usuário', error])
        }
      );
    }

    //Compra de plano premium
    if (this.type === 'premium') {
      this.user.premium = true;
      localStorage.setItem('user', JSON.stringify(this.user));

      this.userService.update(this.user).subscribe(
        success => {
          this.runToastUtil.success(2000, 'Parabéns! Você agora é um usuário PREMIUM');
          setTimeout(() => {
            this.router.navigateByUrl('/dashboard');
          }, 2000);
        },
        error => {
          console.error(['Erro ao atualizar plano do usuário', error])
        }
      )
    }

    //Destaque Projeto
    if (this.type === 'featured') {
      this.jobService.getById(this.jobId).subscribe(
        success => {
          success.featured = true;
          this.jobService.update(this.jobId, success).subscribe(
            success => {
              this.runToastUtil.success(2000, 'Parabéns! Seu projeto agora aparecerá em destaque');
              setTimeout(() => {
                this.router.navigateByUrl('/dashboard')
              }, 2000);
            },
            error => {
              console.error(['Erro ao atualzar job', error])
            }
          );
        },
        error => {
          console.error(['Erro ao obter projeto', error])
        }
      );
    }

    // Projeto Urgente
    if(this.type === 'urgent') {
      this.jobService.getById(this.jobId).subscribe(
        success => {
          success.urgent = true;
          this.jobService.update(this.jobId, success).subscribe(
            success => {
              this.runToastUtil.success(2000, 'Parabéns! Seu projeto agora aparecerá como urgente');
              setTimeout(() => {
                this.router.navigateByUrl('/dashboard')
              }, 2000);
            },
            error => {
              console.error(['Erro ao atualzar job', error])
            }
          );
        },
        error => {
          console.error(['Erro ao obter projeto', error])
        }
      );
    }
    
    //Pagamento de projeto
    if (this.type === 'payment_job') {
      let job: Job;

      this.jobService.getById(this.jobId).subscribe(
        success => {
          job = success;
          job.status = 'em_andamento';
          this.jobService.update(this.jobId, job).subscribe(
            success => {
              this.runToastUtil.success(2000, 'Pagamento efetuado com sucesso! Redirecionando...');
              setTimeout(() => {
                this.router.navigateByUrl(`job/${this.jobId}`);
              }, 2000)
            },
            error => {
              console.error(['Erro ao atualizar status do projeto', error]);
            }
          )
        },  
        error => {
          console.error(['Erro ao recuperar dados do projeto', error]);
        }
      )  
    }

  }

}
