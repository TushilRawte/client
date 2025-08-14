import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentCornerComponent } from './student-corner.component';

const routes: Routes = [{ path: '', component: StudentCornerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentCornerRoutingModule { }
