import { NgModule } from '@angular/core';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';
import { FooterComponent } from './components/footer/footer.component';
import { MessengerWidgetComponent } from './components/messenger-widget/messenger-widget.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    FooterComponent,
    MessengerWidgetComponent
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    ToolbarComponent,
    FooterComponent,
    MessengerWidgetComponent
  ]
})
export class CoreModule { }
