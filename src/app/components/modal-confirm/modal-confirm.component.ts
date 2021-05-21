import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss']
})
export class ModalConfirmComponent implements OnInit {
  
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() text2: string = '';
  @Input() imgName: string = '';
  @Input() textConfirm: string = '';
  @Input() textCancel: string = '';
  
  @Output() sendChooseEvent = new EventEmitter();

  @Input() display: boolean = true;

  constructor() { }

  ngOnInit(): void {
    
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('bg') && this.display) {
        this.display = false;
        this.sendChooseEvent.emit('hide');
      }
    });
  }

  sendChoose(choose: string) {
    this.sendChooseEvent.emit(choose);
  }
}
