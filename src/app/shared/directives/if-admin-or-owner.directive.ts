import { Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../services/account.service';

@Directive({
  selector: '[appIfAdminOrOwner]'
})
export class IfAdminOrOwnerDirective implements OnChanges {
  @Input() appIfAdminOrOwner: string | null = null

  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef, private accountService: AccountService) {

  }


  ngOnChanges(changes: SimpleChanges): void {
    if(this.accountService.currentUser() && (this.accountService.roles()?.includes('Admin') || this.appIfAdminOrOwner === this.accountService.currentUser()?.nick)){
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }else {
      this.viewContainerRef.clear();
    }
  }
  

}
