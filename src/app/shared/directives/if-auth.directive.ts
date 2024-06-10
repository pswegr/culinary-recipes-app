import { Directive, TemplateRef, ViewContainerRef, effect, input } from "@angular/core";
import { AccountService } from "../services/account.service";

@Directive({
  selector: '[appIfAuth]'
})
export class IfAuthDirective {
  appIfAuth = input<boolean>();
  appIfAuthElse = input<TemplateRef<any>>();

  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef, private accountService: AccountService) {
    effect(() => {
      this.viewContainerRef.clear();
      if(this.accountService.currentUser()){
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }else {
        if(this.appIfAuthElse()){
          this.viewContainerRef.createEmbeddedView(this.appIfAuthElse() as TemplateRef<any>);
        }else {
          this.viewContainerRef.clear();
        }
      }
    });
  }
}