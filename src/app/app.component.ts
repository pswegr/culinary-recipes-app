
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

  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2, private themeModeService : ThemeModeService, private overlay: OverlayContainer) {}

  ngOnInit(): void {
    this.applyTheme(true);
  }

  switchMode(isDarkMode: boolean){
    this.applyTheme(isDarkMode);
  }

  private applyTheme(isDarkMode: boolean) {
    const hostClass = isDarkMode ? 'theme-dark' : 'theme-light';

    this.themeClasses.forEach((themeClass) => {
      this.renderer.removeClass(this.document.body, themeClass);
    });
    this.renderer.addClass(this.document.body, hostClass);
    this.themeModeService.isDark.set(isDarkMode);

    const overlayContainer = this.overlay.getContainerElement();
    this.themeClasses.forEach((themeClass) => {
      overlayContainer.classList.remove(themeClass);
    });
    overlayContainer.classList.add(hostClass);
  }
}
