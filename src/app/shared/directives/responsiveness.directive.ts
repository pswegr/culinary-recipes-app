import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Directive, ElementRef, Injector, Input, OnInit, Renderer2, effect } from '@angular/core';
import { ThemeModeService } from '../services/theme-mode.service';

@Directive({
  selector: '[appResponsiveness]'
})
export class ResponsivenessDirective implements OnInit{
  @Input() smallScreens: string[] = [];
  @Input() largeScreens: string[] = [];
  @Input() darkMode: string[] = [];
  @Input() lightMode: string[] = [];
  isDark: boolean = true;

  constructor(private breakpointObserver: BreakpointObserver, private themeModeService: ThemeModeService, private el: ElementRef, private renderer: Renderer2, private injector: Injector) {}

  ngOnInit(): void {
    this.breakpointObserver
    .observe([
      Breakpoints.HandsetPortrait
    ])
    .subscribe(result => {
      const breakpoints = result.breakpoints;

      if(breakpoints[Breakpoints.HandsetPortrait]){
        this.largeScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.smallScreens.forEach(x => {
          this.renderer.addClass(this.el.nativeElement,x)
        });
      }
      else{
        this.smallScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.largeScreens.forEach(x => {
          this.renderer.addClass(this.el.nativeElement,x)
        });
      }
    });

    effect(() => {
      if(this.themeModeService.isDark()){
        this.lightMode.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.darkMode.forEach(x => {
          this.renderer.addClass(this.el.nativeElement,x)
        });
      }
      else{
        this.darkMode.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.lightMode.forEach(x => {
          this.renderer.addClass(this.el.nativeElement,x)
        });
      }
    }, {injector: this.injector})
  }
}
