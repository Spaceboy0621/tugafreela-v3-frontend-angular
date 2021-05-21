import { Component } from '@angular/core';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  template: ` <div id="page">
                <router-outlet></router-outlet>
              </div>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tuga-freela-front';
  constructor(public loadingService: LoadingService){
    
  }
}
