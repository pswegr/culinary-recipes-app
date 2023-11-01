import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { ResponsivenessDirective } from './directives/responsiveness.directive';
import { DoubleClickDirective } from './directives/double-click.directive';
import { ChipClickDirective } from './directives/chip-click.directive';

@NgModule({
  declarations: [
    ResponsivenessDirective,
    DoubleClickDirective,
    ChipClickDirective,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    DragDropModule,
    RouterModule
  ],
  exports:[
    CommonModule,
    MaterialModule,
    DragDropModule,
    RouterModule,
    ResponsivenessDirective,
    DoubleClickDirective,
    ChipClickDirective,
  ]
})
export class SharedModule { }
