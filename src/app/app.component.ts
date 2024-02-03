import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ThemeModeService } from './shared/services/theme-mode.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2, private themeModeService : ThemeModeService, private overlay: OverlayContainer) {}

  ngOnInit(): void {
    this.renderer.setAttribute(this.document.body, 'class', 'theme-dark');
    this.themeModeService.isDark.set(true);
  }

  switchMode(isDarkMode: boolean){
    const hostClass = isDarkMode ? 'theme-dark' : 'theme-light';
    this.renderer.setAttribute(this.document.body, 'class', hostClass);
    this.themeModeService.isDark.set(isDarkMode);
    this.overlay.getContainerElement().classList.add(hostClass);
  }
}
