import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { ResponsivenessDirective } from './directives/responsiveness.directive';
import { DoubleClickDirective } from './directives/double-click.directive';
import { ChipClickDirective } from './directives/chip-click.directive';
import { LoadingComponent } from './components/loading/loading.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { GradientBgDirective } from './directives/gradient-bg.directive';
import { IfAdminOrOwnerDirective } from './directives/if-admin-or-owner.directive';
import { IfAuthDirective } from './directives/if-auth.directive';
import { NgOptimizedImage } from '@angular/common'

@NgModule({
  declarations: [
    ResponsivenessDirective,
    DoubleClickDirective,
    ChipClickDirective,
    GradientBgDirective,
    LoadingComponent,
    PageNotFoundComponent,
    IfAdminOrOwnerDirective,
    IfAuthDirective
  ],
  imports: [
    CommonModule,
    MaterialModule,
    DragDropModule,
    RouterModule,
    NgOptimizedImage
  ],
  exports:[
    CommonModule,
    MaterialModule,
    DragDropModule,
    RouterModule,
    ResponsivenessDirective,
    DoubleClickDirective,
    ChipClickDirective,
    GradientBgDirective,
    LoadingComponent,
    IfAdminOrOwnerDirective,
    IfAuthDirective,
    NgOptimizedImage
  ]
})
export class SharedModule { }
