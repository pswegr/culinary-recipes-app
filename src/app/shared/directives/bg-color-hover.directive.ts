import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
    selector: '[appBgColorHover]',
    standalone: false
})
export class BgColorHoverDirective implements OnChanges {
  @Input() appBgColorHover?: string;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.applyBackground('01');
    this.el.nativeElement.addEventListener('mouseenter', () => this.applyBackground('11'));
    this.el.nativeElement.addEventListener('mouseleave', () => this.applyBackground('01'));
  }

  private applyBackground(opacity: string): void {
    this.el.nativeElement.style.background = `${this.appBgColorHover}${opacity}`;
  }
}
