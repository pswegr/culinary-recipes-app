import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Directive, ElementRef, Injector, Input, OnDestroy, OnInit, Renderer2, effect } from '@angular/core';
import { ThemeModeService } from '../services/theme-mode.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[appResponsiveness]',
    standalone: false
})
export class ResponsivenessDirective implements OnInit, OnDestroy {
  @Input() smallScreens: string[] = [];
  @Input() mediumScreens: string[] = [];
  @Input() largeScreens: string[] = [];
  @Input() darkMode: string[] = [];
  @Input() lightMode: string[] = [];
  isDark: boolean = true;
  breakpointSubsription = Subscription.EMPTY;

  constructor(private breakpointObserver: BreakpointObserver, private themeModeService: ThemeModeService, private el: ElementRef, private renderer: Renderer2, private injector: Injector) {}
  ngOnDestroy(): void {
    this.breakpointSubsription.unsubscribe();
  }

  ngOnInit(): void {
    if(this.mediumScreens.length === 0){
      this.mediumScreens = this.largeScreens;
    }
    this.breakpointSubsription = this.breakpointObserver
    .observe([
      Breakpoints.HandsetPortrait,
      Breakpoints.TabletPortrait
    ])
    .subscribe(result => {
      const breakpoints = result.breakpoints;
      if(breakpoints[Breakpoints.HandsetPortrait]){
        this.largeScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.mediumScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        })
        this.smallScreens.forEach(x => {
          this.renderer.addClass(this.el.nativeElement,x)
        });
      }
      else if(breakpoints[Breakpoints.TabletPortrait]){
        this.smallScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.largeScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.mediumScreens.forEach(x => {
          this.renderer.addClass(this.el.nativeElement,x)
        })
      }
      else{
        this.smallScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        });
        this.mediumScreens.forEach(x => {
          this.renderer.removeClass(this.el.nativeElement,x)
        })
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
