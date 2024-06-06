import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { NgModule } from "@angular/core";
import { ManageAccountComponent } from "./manage-account/manage-account.component";
import { authGuard } from "../core/guards/auth.guard";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { EmailLinkSentComponent } from "./email-link-sent/email-link-sent.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { ConfirmEmailComponent } from "./confirm-email/confirm-email.component";

const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'info', component: ManageAccountComponent, canActivate: [authGuard]},
    {path: 'resetPassword', component: ResetPasswordComponent},
    {path: 'forgotPassword', component: ForgotPasswordComponent},
    {path: 'linkSent', component: EmailLinkSentComponent},
    {path: 'confirmEmail', component: ConfirmEmailComponent}
  ]

  @NgModule({
    declarations: [],
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
  })
  export class AccountRoutingModule { }