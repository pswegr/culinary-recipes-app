import { NgModule } from '@angular/core';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    FooterComponent
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    ToolbarComponent,
    FooterComponent
  ]
})
export class CoreModule { }
