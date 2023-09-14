import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ResponsivenessDirective } from './directives/responsiveness.directive';
import { ImageAvgColorDirective } from './directives/image-avg-color.directive';



@NgModule({
  declarations: [
    ResponsivenessDirective,
    ImageAvgColorDirective
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MaterialModule,
    DragDropModule,
    RouterModule
  ],
  exports:[
    BrowserAnimationsModule,
    CommonModule,
    MaterialModule,
    DragDropModule,
    RouterModule,
    ResponsivenessDirective,
    ImageAvgColorDirective
  ]
})
export class SharedModule { }
