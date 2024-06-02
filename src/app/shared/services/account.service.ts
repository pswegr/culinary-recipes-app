import { HttpClient } from '@angular/common/http';
import { ApplicationRef, Injectable, computed, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserModel } from '../models/user.model';
import { map } from 'rxjs';
import { LoginRequestModel } from '../models/login-request.model';

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

  register(model: any) {
    return this.http.post<UserModel>(this.baseUrl + 'account/register', model).pipe(
      map(user => {
        if (user) {
          this.setCurrentUser(user);
        }
        return user;
      })
    )
  }

  setCurrentUser(user: UserModel) {
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
