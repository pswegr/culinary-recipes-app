import { Component, inject } from '@angular/core';
import { I18nService } from '../shared/services/i18n.service';

@Component({
    selector: 'app-terms',
    templateUrl: './terms.component.html',
    styleUrls: ['./terms.component.scss'],
    standalone: false
})
export class TermsComponent {
  readonly i18nService = inject(I18nService);
}
