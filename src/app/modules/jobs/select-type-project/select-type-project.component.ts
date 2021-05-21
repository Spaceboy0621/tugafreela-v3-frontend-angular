import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-select-type-project',
  templateUrl: './select-type-project.component.html',
  styleUrls: ['./select-type-project.component.scss']
})
export class SelectTypeProjectComponent implements OnInit {

  @Output() eventType = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  close(event) {
  }

  continue() {
    this.eventType.emit('continue');
  }

  featured() {
    this.eventType.emit('featured');
  }

  urgent() {
    this.eventType.emit('urgent');
  }
}
