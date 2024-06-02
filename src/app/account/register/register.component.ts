import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Subscription, catchError, debounceTime, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  passwordSub? = Subscription.EMPTY;

  constructor(private fb: FormBuilder) { }

  ngOnDestroy(): void {
    this.passwordSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email], [this.emailValidator()]],
      nickname: ['', [Validators.required], [this.nicknameValidator()]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.passwordSub = this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { email, nickname, password } = this.registerForm.value;
      console.log('Registration successful', { email, nickname, password });
      // Handle registration logic here
    }
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        switchMap(email => this.checkEmail(email)),
        map(isTaken => (isTaken ? { emailTaken: true } : null)),
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
        switchMap(nickname => this.checkNickname(nickname)),
        map(isTaken => (isTaken ? { nicknameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  checkEmail(email: string): Observable<boolean> {
    // Simulate an email check
    const takenEmails = ['test@example.com', 'user@example.com'];
    return of(takenEmails.includes(email)).pipe(debounceTime(1000));
  }

  checkNickname(nickname: string): Observable<boolean> {
    // Simulate a nickname check
    const takenNicknames = ['admin', 'user', 'test'];
    return of(takenNicknames.includes(nickname)).pipe(debounceTime(1000));
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
