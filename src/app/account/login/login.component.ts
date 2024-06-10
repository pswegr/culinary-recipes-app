import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginRequestModel } from 'src/app/shared/models/login-request.model';
import { AccountService } from 'src/app/shared/services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy{
  returnUrl: string;
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });
  
  errorMessage: string = '';

  loginSub = Subscription.EMPTY;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || ''
   }

  ngOnDestroy(): void {
    this.loginSub.unsubscribe();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;

      const model: LoginRequestModel = {email, password, rememberMe}

      this.loginSub = this.accountService.login(model).subscribe({
        next: _ => {
          this.router.navigateByUrl(this.returnUrl)
        }
      })
    }
  }
}
