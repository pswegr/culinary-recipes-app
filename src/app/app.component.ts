
import { Component, Inject, OnInit, Renderer2, DOCUMENT } from '@angular/core';
import { ThemeModeService } from './shared/services/theme-mode.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  private readonly themeClasses = ['theme-dark', 'theme-light'];
  private readonly themeColors = {
    dark: 'rgb(56, 36, 19)',
    light: 'rgb(253, 247, 239)'
  };

  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2, private themeModeService : ThemeModeService, private overlay: OverlayContainer) {}

  ngOnInit(): void {
    this.applyTheme(true);
  }

  switchMode(isDarkMode: boolean){
    this.applyTheme(isDarkMode);
  }

  private applyTheme(isDarkMode: boolean) {
    const hostClass = isDarkMode ? 'theme-dark' : 'theme-light';
    const themeColor = isDarkMode ? this.themeColors.dark : this.themeColors.light;

    [this.document.documentElement, this.document.body].forEach((host) => {
      this.themeClasses.forEach((themeClass) => {
        this.renderer.removeClass(host, themeClass);
      });
      this.renderer.addClass(host, hostClass);
    });
    this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    this.themeModeService.isDark.set(isDarkMode);

    const overlayContainer = this.overlay.getContainerElement();
    this.themeClasses.forEach((themeClass) => {
      overlayContainer.classList.remove(themeClass);
    });
    overlayContainer.classList.add(hostClass);
  }
}
