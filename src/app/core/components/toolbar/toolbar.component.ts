import { Component, EventEmitter, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() readonly darkModeSwitched = new EventEmitter<boolean>();

  onDarkModeSwithed({checked} : MatSlideToggleChange){
    this.darkModeSwitched.emit(checked);
  }
}
