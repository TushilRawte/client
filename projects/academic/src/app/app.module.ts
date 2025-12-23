import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule, ReporttableComponent, ReportComponent } from 'shared';
import { CapslockDirective } from '../../../shared/directive/capslock.directive';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CourseAttendanceReportComponent } from './attendance/course-attendance-report/course-attendance-report.component';
import { CourseAttendanceComponent } from './attendance/course-attendance/course-attendance.component';
import { CourseAllotmentComponent } from './course-allotment/course-allotment.component';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
import { CourseFinalizeComponent } from './course-finalize/course-finalize.component';
import { CourseallotDashboardComponent } from './courseallot-dashboard/courseallot-dashboard.component';
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
import { StudentCategoryChangeComponent } from './student/student-category-change/student-category-change.component';
import { StudentMobileNumberUpdateComponent } from './student/student-mobile-number-update/student-mobile-number-update.component';
import { StudentNameCorrectionComponent } from './student/student-name-correction/student-name-correction.component';
import { StudentPasswordResetComponent } from './student/student-password-reset/student-password-reset.component';
import { StudentAddressChangeRequestComponent } from './student/student-address-change-request/student-address-change-request.component';
import { ApproveUidnComponent } from './student-profile/approve-uidn/approve-uidn.component';
import { AppliedListComponent } from './student/transfer-certificate/applied-list/applied-list.component';
import { PromoteEvenSemesterComponent } from './student-academic-status/promote-even-semester/promote-even-semester.component';
import { MarksEntryPracticalComponent } from './marks entry/marks-entry-practical/marks-entry-practical.component';
import { MarksEntryInternalPracticalComponent } from './marks entry/marks-entry-internal-practical/marks-entry-internal-practical.component';
import { MarksEntryReportComponent } from './marks entry/marks-entry-report/marks-entry-report.component';
import { MarksEntryAbsentComponent } from './marks entry/marks-entry-absent/marks-entry-absent.component';
import { PdcEsignComponent } from './student/pdc-esign/pdc-esign.component';
import { PdcGenerateComponent } from './student/pdc-generate/pdc-generate.component';
import { PdcReportComponent } from './student/pdc-report/pdc-report.component';
import { SrcReportComponent } from './student/src-report/src-report.component';
import { TranscriptEsignComponent } from './student/transcript-esign/transcript-esign.component';
import { TranscriptReportComponent } from './student/transcript-report/transcript-report.component';
import { TranscriptGenerateComponent } from './student/transcript-generate/transcript-generate.component';
import { StudentAddressChangeRequestPopupComponent } from './student/student-address-change-request-popup/student-address-change-request-popup.component';
import { StudentBasicDetailsUpdateComponent } from './student/student-basic-details-update/student-basic-details-update.component';
import { StudentBasicDetailsUpdatePopupComponent } from './student/student-basic-details-update-popup/student-basic-details-update-popup.component';
import { RegistrationReportComponent } from './registration/registration-report/registration-report.component';
import { ExamTimeTableComponent } from './time-table/exam-time-table/exam-time-table.component';
import { ExamTimeTableReportComponent } from './time-table/exam-time-table-report/exam-time-table-report.component';
import { SrcReportByStudentComponent } from './student/src-report-by-student/src-report-by-student.component';
import { SrcEsignComponent } from './student/src-esign/src-esign.component';
import { GeneratedListComponent } from './student/transfer-certificate/applied-list/generated-list/generated-list.component';
import { CollegeTransferComponent } from './student/college-transfer/college-transfer.component';
import { CollegeTransferReportComponent } from './student/college-transfer-report/college-transfer-report.component';
import { MigrationCertificateComponent } from './student/migration-certificate/migration-certificate.component';
import { AppliedStudentsDashboardComponent } from './marks entry/applied-students-dashboard/applied-students-dashboard.component';
import { UpdateCourseTypeComponent } from './course/update-course-type/update-course-type.component';
import { RevaluationCancelComponent } from './marks entry/revaluation-cancel/revaluation-cancel.component';
import { SrcGeneratePdfComponent } from './student/src-generate-pdf/src-generate-pdf.component';
import { StudentMobileNumberChangeRequestComponent } from './student/student-mobile-number-change-request/student-mobile-number-change-request.component';
import { CorrigendumApplyAdminComponent } from './corrigendum/corrigendum-apply-admin/corrigendum-apply-admin.component';
import { UidnReportComponent } from './student-profile/uidn-report/uidn-report.component';
import { AttendanceUnfinalizeComponent } from './attendance/attendance-unfinalize/attendance-unfinalize.component';

@NgModule({
  declarations: [
    AppComponent,
    CourseDashboardComponent,
    CourseAllotmentComponent,
    ViewCourseallotmentComponent,
    CourseallotDashboardComponent,
    CourseFinalizeComponent,
    TeacherAllotmentComponent,
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
    StudentCategoryChangeComponent,
    StudentMobileNumberUpdateComponent,
    StudentNameCorrectionComponent,
    StudentPasswordResetComponent,
    StudentAddressChangeRequestComponent,
    ApproveUidnComponent,
    AppliedListComponent,
    PromoteEvenSemesterComponent,
    MarksEntryPracticalComponent,
    MarksEntryInternalPracticalComponent,
    MarksEntryReportComponent,
    MarksEntryAbsentComponent,
    PdcEsignComponent,
    PdcGenerateComponent,
    PdcReportComponent,
    SrcReportComponent,
    TranscriptEsignComponent,
    TranscriptReportComponent,
    TranscriptGenerateComponent,
    StudentAddressChangeRequestPopupComponent,
    StudentBasicDetailsUpdateComponent,
    StudentBasicDetailsUpdatePopupComponent,
    RegistrationReportComponent,
    ExamTimeTableComponent,
    ExamTimeTableReportComponent,
    SrcReportByStudentComponent,
    SrcEsignComponent,
    GeneratedListComponent,
    CollegeTransferComponent,
    CollegeTransferReportComponent,
    MigrationCertificateComponent,
    AppliedStudentsDashboardComponent,
    UpdateCourseTypeComponent,
    RevaluationCancelComponent,
    SrcGeneratePdfComponent,
    StudentMobileNumberChangeRequestComponent,
    CorrigendumApplyAdminComponent,
    UidnReportComponent,
    AttendanceUnfinalizeComponent,
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
