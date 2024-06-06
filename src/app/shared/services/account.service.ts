import { HttpClient, HttpParams } from '@angular/common/http';
import { ApplicationRef, Injectable, computed, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserModel } from '../models/user.model';
import { map } from 'rxjs';
import { LoginRequestModel } from '../models/login-request.model';
import { SendEmailLinkModel } from '../models/send-email-link.model';
import { CommonResponseModel } from '../models/common-response.model';
import { ResetPasswordModel } from '../models/reset-password.model';
import { RegisterModel } from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService{
  private http = inject(HttpClient);
  private applicationRef = inject(ApplicationRef)
  baseUrl = environment.apiUrl;
  currentUser = signal<UserModel | null>((JSON.parse(localStorage.getItem('user')!)) as UserModel);
  roles = computed(() => {
    const user = this.currentUser();
    if (user && user.token) {
      const decodedToken = JSON.parse(atob(user.token.split('.')[1]))

      const roleString = Object.keys(decodedToken).filter((t) =>
        t.endsWith('/role')
      );

      let roles : string[] = [];
      roleString.forEach(x => 
        roles.push(decodedToken[x])
      )
      return roles
    }
    return null;
  })

  login(model: LoginRequestModel) {
    return this.http.post<UserModel>(this.baseUrl + 'account/login', model).pipe(
      map(user => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  register(model: RegisterModel) {
    return this.http.post<CommonResponseModel>(this.baseUrl + 'account/register', model);
  }

  isEmailUnique(model: string) {
    return this.http.post<boolean>(this.baseUrl + 'account/isEmailValid', { property: model });
  }

  isNickValid(model: string) {
    return this.http.post<boolean>(this.baseUrl + 'account/isNickValid', { property: model });
  }

  sendEmailLink(model: SendEmailLinkModel) {
    return this.http.post<CommonResponseModel>(this.baseUrl + 'account/forgotPassword', model )
  }

  resetPassword(model: ResetPasswordModel) {
    return this.http.post<CommonResponseModel>(this.baseUrl + 'account/resetPassword', model )
  }

  confirmEmail(email: string, token: string) {
    const searchParams = new URLSearchParams();
    if(email){
      searchParams.append('email', email)
    }
    if(token){
      searchParams.append('token', token)
    }
    return this.http.get<CommonResponseModel>(this.baseUrl + 'account/confirmEmail?' + searchParams.toString() )
  }

  private setCurrentUser(user: UserModel) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.applicationRef.tick()
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.applicationRef.tick()
  }
}
