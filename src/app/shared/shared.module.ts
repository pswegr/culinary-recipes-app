import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ResponsivenessDirective } from './directives/responsiveness.directive';



@NgModule({
  declarations: [
    ResponsivenessDirective
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
    ResponsivenessDirective
  ]
})
export class SharedModule { }
