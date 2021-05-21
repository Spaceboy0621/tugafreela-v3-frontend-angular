import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer2',
  templateUrl: './footer2.component.html',
  styleUrls: ['./footer2.component.scss']
})
export class Footer2Component implements OnInit {
  
  actualYear: number;
  
  constructor() { }

  ngOnInit(): void {
    this.actualYear = new Date().getFullYear();
  }

}
