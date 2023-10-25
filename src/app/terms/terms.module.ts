import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsComponent } from './terms.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    TermsComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class TermsModule { }
