import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SendEmailLinkModel } from 'src/app/shared/models/send-email-link.model';
import { AccountService } from 'src/app/shared/services/account.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  linkSendSub = Subscription.EMPTY;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private activatedRoute: ActivatedRoute) {
 
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email } = this.loginForm.value;

      const model: SendEmailLinkModel = {email}

      this.linkSendSub = this.accountService.sendEmailLink(model).subscribe({
        next: _ => {
          this.router.navigateByUrl('/account/linkSent')
        }
      })
    }
  }
}
