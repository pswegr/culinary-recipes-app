import { Directive, TemplateRef, ViewContainerRef, effect, input } from "@angular/core";
import { AccountService } from "../services/account.service";

@Directive({
  selector: '[appIfAuth]'
})
export class IfAuthDirective {

  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef, private accountService: AccountService) {
    effect(() => {
      if(this.accountService.currentUser()){
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }else {
        this.viewContainerRef.clear();
      }
    });
  }
}