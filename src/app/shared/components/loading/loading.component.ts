import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss',
    standalone: false
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService){} 
}
