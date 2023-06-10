import { DOCUMENT } from '@angular/common';
import { Component, HostBinding, Inject, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setAttribute(this.document.body, 'class', 'theme-light');
  }

  switchMode(isDarkMode: boolean){
    const hostClass = isDarkMode ? 'theme-dark' : 'theme-light';
    this.renderer.setAttribute(this.document.body, 'class', hostClass)
  }
}
