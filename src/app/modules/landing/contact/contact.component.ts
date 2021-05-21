import { EmailService } from '../../../services/email.service';
import { Email } from '../../../models/email.model';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  formContact: FormGroup;
  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private emailService: EmailService
  ) { }

  ngOnInit(): void {
    this.formContact = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      whats: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  send() {
    if(!this.formContact.valid) {
      this.runError('Verifique os campos', 'Ops! Algo deu errado');
      return;
    }
    this.loader = true;

    const email = new Email(
      {
        replyTo: this.formContact.value.email,
        subject: 'Contato',
        text: this.formContact.value.message,
        html: `
          <h3>Contato via Aplicação</h3>
          <p><b>Nome:</b> ${this.formContact.value.name}</p>
          <p><b>Whats:</b> ${this.formContact.value.whats}</p>
          <p><b>Email:</b> ${this.formContact.value.email}</p>
          <p>${this.formContact.value.message}</p>
        `
      }
    );

    this.emailService.send(email).subscribe(
      success => {
        this.loader = false;
        this.runSuccess('Mensagem enviada', 'Oba! Tudo certo');

      },
      error => this.runError('Erro ao enviar mensagem', 'Ops! Algo deu errado')
    )
  }

  runError(message: string, title: string) {
    this.toastrService.error(message, title, {
      progressBar: true
    });
  }

  runSuccess(message: string, title: string) {
    this.toastrService.success(message, title, {
      progressBar: true
    });
  }

}
