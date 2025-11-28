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
import { MarksEntryUnfinalizeComponent } from './marks entry/marks-entry-unfinalize/marks-entry-unfinalize.component';
import { MarksEntryThesisComponent } from './marks entry/marks-entry-thesis/marks-entry-thesis.component';
import { MarksEntryThesisUnfinalizeComponent } from './marks entry/marks-entry-thesis-unfinalize/marks-entry-thesis-unfinalize.component';
import { MarksEntryExportComponent } from './marks entry/marks-entry-export/marks-entry-export.component';
import { MarksEntryDropdownComponent } from './marks entry/marks-entry-dropdown/marks-entry-dropdown.component';
import { GenerateUidnComponent } from './student-profile/generate-uidn/generate-uidn.component';
import { CheckDocumentForUidnComponent } from './student-profile/check-document-for-uidn/check-document-for-uidn.component';
import { SrcGenerateComponent } from './semester-report-card/src-generate/src-generate.component';

import { AutomaticRegistrationComponent } from './registration/automatic-registration/automatic-registration.component';
import { PaymentSettlementComponent } from './payment-settlement/payment-settlement.component';
import { FacultyListComponent } from './registration/faculty-list/faculty-list.component';
import { ResultNotificationComponent } from './marks entry/result-notification/result-notification.component';
import { ApproveUidnComponent } from './student-profile/approve-uidn/approve-uidn.component';


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
    MarksEntryUnfinalizeComponent,
    MarksEntryThesisComponent,
    MarksEntryThesisUnfinalizeComponent,
    MarksEntryExportComponent,
    MarksEntryDropdownComponent,
    GenerateUidnComponent,
    CheckDocumentForUidnComponent,
    SrcGenerateComponent,
    AutomaticRegistrationComponent,
    PaymentSettlementComponent,
    FacultyListComponent,
    ResultNotificationComponent,
    ApproveUidnComponent,

  ],
  imports: [
    SharedModule,
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    ReporttableComponent,
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
