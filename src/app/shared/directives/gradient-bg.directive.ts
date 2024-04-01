import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appGradientBg]'
})
export class GradientBgDirective implements OnChanges {
  @Input() appGradientBg?: string;
  @Input() gradientColor?: string;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.el.nativeElement.style.background = `linear-gradient(${this.appGradientBg}, #02002400 0%, #0d0d4b00 20%, ${this.gradientColor ?? '#888888'}14 100%)`
  }
}
