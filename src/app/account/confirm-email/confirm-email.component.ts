import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { AccountService } from 'src/app/shared/services/account.service';

@Component({
    selector: 'app-confirm-email',
    templateUrl: './confirm-email.component.html',
    styleUrl: './confirm-email.component.scss',
    standalone: false
})
export class ConfirmEmailComponent {
  confirmEmail$ = this.route.queryParams.pipe(
    switchMap(params => {
      const {  email, token } = params;
      return this.accountService.confirmEmail(email, token)
    })
  )
  constructor(private accountService: AccountService, private route: ActivatedRoute){}
}
