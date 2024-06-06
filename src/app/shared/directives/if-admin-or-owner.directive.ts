import { Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef, effect, input } from '@angular/core';
import { AccountService } from '../services/account.service';

@Directive({
  selector: '[appIfAdminOrOwner]'
})
export class IfAdminOrOwnerDirective {
  appIfAdminOrOwner = input<string>();

  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef, private accountService: AccountService) {
    effect(() => {
      if(this.accountService.currentUser() && (this.accountService.roles()?.includes('Admin') || this.appIfAdminOrOwner() === this.accountService.currentUser()?.nick)){
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }else {
        this.viewContainerRef.clear();
      }
    });
  }
}
