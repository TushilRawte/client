import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentCornerRoutingModule } from './student-corner-routing.module';
import { StudentCornerComponent } from './student-corner.component';
import { SharedModule } from 'shared';


@NgModule({
  declarations: [
    StudentCornerComponent
  ],
  imports: [
    CommonModule,
    StudentCornerRoutingModule,
    // SharedModule,
  ]
})
export class StudentCornerModule { }
