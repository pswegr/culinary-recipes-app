import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { AccountService } from 'src/app/shared/services/account.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnDestroy {
  resetPasswordForm: FormGroup = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator } as AbstractControlOptions);

  resetPasswordSub = Subscription.EMPTY;

  constructor(private fb: FormBuilder, private accountService: AccountService, private route: ActivatedRoute, private alertService: AlertService, private router: Router) { }

  ngOnDestroy(): void {
    this.resetPasswordSub.unsubscribe();
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const { password } = this.resetPasswordForm.value;
      this.resetPasswordSub = this.route.queryParams.pipe(
        switchMap(params => {
          const {token, email} = params;
          return this.accountService.resetPassword({token,email,password})
        })
      ).subscribe(x => {
        this.alertService.openSnackBar(x.message);
        this.router.navigate(['/']);
      })
    }
  }

  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
