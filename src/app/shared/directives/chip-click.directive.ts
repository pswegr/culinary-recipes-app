import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appChipClick]'
})
export class ChipClickDirective {
  @Output() chipClick = new EventEmitter<any>();

  constructor(private chip: ElementRef) { }

  @HostListener('click', ['$event']) 
  onClick(event : MouseEvent) : void {
    this.chipClick.emit(this.chip.nativeElement.innerText)
  }
}
