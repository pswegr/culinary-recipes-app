import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, catchError, debounceTime, map, of, switchMap } from 'rxjs';
import { AccountService } from 'src/app/shared/services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnDestroy {
  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email], [this.emailValidator()]],
    nickname: ['', [Validators.required], [this.nicknameValidator()]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator } as AbstractControlOptions);

  registerSub = Subscription.EMPTY;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router) { }

  ngOnDestroy(): void {
    this.registerSub.unsubscribe();
  }


  onSubmit(): void {
    if (this.registerForm.valid) {
      const { email, nickname, password } = this.registerForm.value;

      this.registerSub = this.accountService.register({ email, nick: nickname, password }).subscribe(
        x => {
          this.router.navigate(['/account/register-succeded']);
        }
      )
    }
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        switchMap(email => this.accountService.isEmailUnique(email)),
        map(isUnique => (isUnique ? null : { emailTaken: true })),
        catchError(() => of(null))
      );
    };
  }

  nicknameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        switchMap(nickname => this.accountService.isNickValid(nickname)),
        map(isValid => (isValid ? null : { nicknameInvalid: true })),
        catchError(() => of(null))
      );
    };
  }

  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
