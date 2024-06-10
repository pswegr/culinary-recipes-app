import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from 'src/app/shared/services/account.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if(accountService.currentUser() && accountService.roles()?.includes('Admin')){
    return true
  }else{
    router.navigate(['/account/login'], {queryParams: {returnUrl: state.url}});
    return false
  }
};
