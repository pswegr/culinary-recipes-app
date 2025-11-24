import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
    selector: '[appGradientBg]',
    standalone: false
})
export class GradientBgDirective implements OnChanges {
  @Input() appGradientBg?: string;
  @Input() gradientColor?: string;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.el.nativeElement.style.background = `linear-gradient(${this.appGradientBg}, #0d0d4b00 0%, ${this.gradientColor ?? '#888888'} 3000%)`
  }
}
