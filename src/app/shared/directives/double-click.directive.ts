import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDoubleClick]'
})
export class DoubleClickDirective {
  @Output() doubleClick = new EventEmitter<any>();
  @Input() appDoubleClick: string = ''; //id
  private clickTimeout: any = null;

  @HostListener('click', ['$event']) 
  onClick(event : MouseEvent) : void {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;

      this.doubleClick.emit(this.appDoubleClick);
    } else {
      this.clickTimeout = setTimeout(() => {
        this.clickTimeout = null;
      }, 250);
    }
  }

  constructor() { }

}
