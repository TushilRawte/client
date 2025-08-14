import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
import { SharedModule } from 'shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CapslockDirective } from '../../../shared/directive/capslock.directive';
import { CourseAllotmentComponent } from './course-allotment/course-allotment.component';
import { ViewCourseallotmentComponent } from './view-courseallotment/view-courseallotment.component';
import { CourseallotDashboardComponent } from './courseallot-dashboard/courseallot-dashboard.component';
import { CourseFinalizeComponent } from './course-finalize/course-finalize.component';
import { TeacherAllotmentComponent } from './teacher-allotment/teacher-allotment.component';
import { FormsModule } from '@angular/forms';
import { CourseRegistrationComponent } from './registration/course-registration/course-registration.component';


@NgModule({
  declarations: [
    AppComponent,
    CourseDashboardComponent,
    CourseAllotmentComponent,
    ViewCourseallotmentComponent,
    CourseallotDashboardComponent,
    CourseFinalizeComponent,
    TeacherAllotmentComponent,
    CourseRegistrationComponent,

  ],
  imports: [
    SharedModule,
    BrowserModule,
    NgbModule,
    AppRoutingModule,
     CapslockDirective,
     FormsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: true,
          registrationStrategy: 'registerWhenStable:30000'
        })
  ],
 providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
