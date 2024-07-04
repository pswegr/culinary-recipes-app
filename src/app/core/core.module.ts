import { NgModule } from '@angular/core';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ToolbarComponent
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    ToolbarComponent
  ]
})
export class CoreModule { }
