import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EmailLinkSentComponent } from './email-link-sent/email-link-sent.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { RegisterSuccededComponent } from './register-succeded/register-succeded.component';



@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ManageAccountComponent,
    ResetPasswordComponent,
    EmailLinkSentComponent,
    ForgotPasswordComponent,
    ConfirmEmailComponent,
    RegisterSuccededComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ]
})
export class AccountModule { }
