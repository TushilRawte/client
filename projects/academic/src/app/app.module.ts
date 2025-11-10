import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule, ReporttableComponent,ReportComponent } from 'shared';
import { CapslockDirective } from '../../../shared/directive/capslock.directive';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CourseAttendanceReportComponent } from './attendance/course-attendance-report/course-attendance-report.component';
import { CourseAttendanceComponent } from './attendance/course-attendance/course-attendance.component';
import { CourseAllotmentComponent } from './course-allotment/course-allotment.component';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
import { CourseFinalizeComponent } from './course-finalize/course-finalize.component';
import { CourseallotDashboardComponent } from './courseallot-dashboard/courseallot-dashboard.component';
import { CourseRegistrationComponent } from './registration/course-registration/course-registration.component';
import { CourseRegistrationUnfinlizeComponent } from './course-registration-unfinlize/course-registration-unfinlize.component';
import { TeacherSectionAllotmentComponent } from './teacher-section-allotment/teacher-section-allotment.component';
import { StudentSectionAllotmentComponent } from './student-section-allotment/student-section-allotment.component';
import { TeacherAllotmentComponent } from './teacher-allotment/teacher-allotment.component';
import { ViewCourseallotmentComponent } from './view-courseallotment/view-courseallotment.component';
import { MarksEntryAdminComponent } from './marks entry/marks-entry-admin/marks-entry-admin.component';
import { MarksEntryFacultyComponent } from './marks entry/marks-entry-faculty/marks-entry-faculty.component';
import { MarksEntryImportComponent } from './marks entry/marks-entry-import/marks-entry-import.component';
import { AutomaticRegistrationComponent } from './registration/automatic-registration/automatic-registration.component';
import { PaymentSettlementComponent } from './payment-settlement/payment-settlement.component';


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
    CourseRegistrationUnfinlizeComponent,
    TeacherSectionAllotmentComponent,
    StudentSectionAllotmentComponent,
    CourseAttendanceComponent,
    CourseAttendanceReportComponent,
    MarksEntryAdminComponent,
    MarksEntryFacultyComponent,
    MarksEntryImportComponent,
    AutomaticRegistrationComponent,
    PaymentSettlementComponent,

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
    }),
    ReportComponent,
    ReporttableComponent
],
 providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
