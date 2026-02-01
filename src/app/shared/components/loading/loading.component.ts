import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss',
    standalone: false
})
export class LoadingComponent {
  skeletonCards = Array.from({ length: 6 });
  skeletonChips = Array.from({ length: 5 });
  skeletonLines = Array.from({ length: 2 });

  constructor(public loadingService: LoadingService){} 
}
