import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent, NotFoundComponent, UpdateRoutesComponent } from 'shared';
import { CourseAttendanceReportComponent } from './attendance/course-attendance-report/course-attendance-report.component';
import { CourseAttendanceComponent } from './attendance/course-attendance/course-attendance.component';
import { CourseAllotmentComponent } from './course-allotment/course-allotment.component';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
import { CourseFinalizeComponent } from './course-finalize/course-finalize.component';
import { CourseRegistrationUnfinlizeComponent } from './course-registration-unfinlize/course-registration-unfinlize.component';
import { CourseallotDashboardComponent } from './courseallot-dashboard/courseallot-dashboard.component';
import { MarksEntryAdminComponent } from './marks entry/marks-entry-admin/marks-entry-admin.component';
import { MarksEntryExportComponent } from './marks entry/marks-entry-export/marks-entry-export.component';
import { MarksEntryFacultyComponent } from './marks entry/marks-entry-faculty/marks-entry-faculty.component';
import { MarksEntryImportComponent } from './marks entry/marks-entry-import/marks-entry-import.component';
import { MarksEntryThesisUnfinalizeComponent } from './marks entry/marks-entry-thesis-unfinalize/marks-entry-thesis-unfinalize.component';
import { MarksEntryThesisComponent } from './marks entry/marks-entry-thesis/marks-entry-thesis.component';
import { MarksEntryUnfinalizeComponent } from './marks entry/marks-entry-unfinalize/marks-entry-unfinalize.component';
import { ResultNotificationComponent } from './marks entry/result-notification/result-notification.component';
import { PaymentSettlementComponent } from './payment-settlement/payment-settlement.component';
import { AutomaticRegistrationComponent } from './registration/automatic-registration/automatic-registration.component';
import { CourseRegistrationComponent } from './registration/course-registration/course-registration.component';
import { FacultyListComponent } from './registration/faculty-list/faculty-list.component';
import { RegistrationReportComponent } from './registration/registration-report/registration-report.component';
import { SrcGenerateComponent } from './semester-report-card/src-generate/src-generate.component';
import { PromoteEvenSemesterComponent } from './student-academic-status/promote-even-semester/promote-even-semester.component';
import { ApproveUidnComponent } from './student-profile/approve-uidn/approve-uidn.component';
import { GenerateUidnComponent } from './student-profile/generate-uidn/generate-uidn.component';
import { StudentSectionAllotmentComponent } from './student-section-allotment/student-section-allotment.component';
import { PdcEsignComponent } from './student/pdc-esign/pdc-esign.component';
import { PdcGenerateComponent } from './student/pdc-generate/pdc-generate.component';
import { PdcReportComponent } from './student/pdc-report/pdc-report.component';
import { StudentAddressChangeRequestComponent } from './student/student-address-change-request/student-address-change-request.component';
import { StudentBasicDetailsUpdateComponent } from './student/student-basic-details-update/student-basic-details-update.component';
import { StudentCategoryChangeComponent } from './student/student-category-change/student-category-change.component';
import { StudentMobileNumberUpdateComponent } from './student/student-mobile-number-update/student-mobile-number-update.component';
import { StudentNameCorrectionComponent } from './student/student-name-correction/student-name-correction.component';
import { StudentPasswordResetComponent } from './student/student-password-reset/student-password-reset.component';
import { TranscriptEsignComponent } from './student/transcript-esign/transcript-esign.component';
import { TranscriptGenerateComponent } from './student/transcript-generate/transcript-generate.component';
import { TranscriptReportComponent } from './student/transcript-report/transcript-report.component';
import { TeacherAllotmentComponent } from './teacher-allotment/teacher-allotment.component';
import { CourseAttendanceFinalizeComponent } from './attendance/course-attendance-finalize/course-attendance-finalize.component';
import { ExamTimeTableComponent } from './time-table/exam-time-table/exam-time-table.component';
import { ExamTimeTableReportComponent } from './time-table/exam-time-table-report/exam-time-table-report.component';
import { SrcReportComponent } from './student/src-report/src-report.component';
import { SrcReportByStudentComponent } from './student/src-report-by-student/src-report-by-student.component';
import { SrcEsignComponent } from './student/src-esign/src-esign.component';
import { AppliedListComponent } from './student/transfer-certificate/applied-list/applied-list.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '404',
        component: NotFoundComponent,
        title: 'Page Not Found',
      },
      {
        path: 'course-allotment-dashboard',
        component: CourseDashboardComponent,
        pathMatch: 'full',
      },
      {
        path: 'course-allotment',
        component: CourseAllotmentComponent,
        pathMatch: 'full',
        children: [

        ]
      },
      {
        path: 'coursealt-dash',
        component: CourseallotDashboardComponent,
        pathMatch: 'full',
      },
      {
        path: 'course-finalize',
        component: CourseFinalizeComponent,
        pathMatch: 'full',
      },
      {
        path: 'teacher-allotment',
        component: TeacherAllotmentComponent,
        pathMatch: 'full',
      },
      {
        path: 'course-registration',
        component: CourseRegistrationComponent,
        // pathMatch: 'full',
      },
      {
        path: 'course-registration-unfinalize',
        component: CourseRegistrationUnfinlizeComponent,
        // pathMatch: 'full',
      },
      {
        path: 'student-section-allotment',
        component: StudentSectionAllotmentComponent,
        // pathMatch: 'full',
      },
      {
        path: 'course-attendance',
        component: CourseAttendanceComponent,
        pathMatch: 'full',
      },
      {
        path: 'course-attendance-report',
        component: CourseAttendanceReportComponent,
        pathMatch: 'full',
      },
      {
        path: 'course-attendance-finalize',
        component: CourseAttendanceFinalizeComponent,
        pathMatch: 'full',
      },
      {
        path: 'marks-entry-faculty',  // getRegisteredCourses
        component: MarksEntryFacultyComponent,
        pathMatch: 'full',
      },
      {
        path: 'marks-entry-import',  // getRegisteredCourses
        component: MarksEntryImportComponent,
        pathMatch: 'full',
      },
      {
        path: 'marks-entry-admin',
        component: MarksEntryAdminComponent,
        pathMatch: 'full',
      },
      {
        path: 'marks-entry-unfinalize',
        component: MarksEntryUnfinalizeComponent,
        pathMatch: 'full',
      },
      {
        path: 'marks-entry-thesis',
        component: MarksEntryThesisComponent,
        pathMatch: 'full',
      },
      {
        path: 'marks-entry-thesis-unfinalize',
        component: MarksEntryThesisUnfinalizeComponent,
        pathMatch: 'full',
      },
      {
        path: 'marks-entry-export',
        component: MarksEntryExportComponent,
        pathMatch: 'full',
      },
      {
        path: 'genrate-uidn',
        component: GenerateUidnComponent,
        pathMatch: 'full',
      },
      {
        path: 'approve-uidn',
        component: ApproveUidnComponent,
        pathMatch: 'full',
      },
      {
        path: 'src-generate',
        component: SrcGenerateComponent,

      },
      {
        path: 'result-notification',
        component: ResultNotificationComponent,
        pathMatch: 'full',
      },
      {
        path: 'automatic-registration',
        component: AutomaticRegistrationComponent,
        pathMatch: 'full',
      },
      {
        path: 'faculty-list',
        component: FacultyListComponent,
        pathMatch: 'full',
      },
      {
        path: 'payment-settlement',
        component: PaymentSettlementComponent,
        pathMatch: 'full',
      },
      {
        path: 'student-password-reset',
        component: StudentPasswordResetComponent,
        pathMatch: 'full',
      },
      {
        path: 'student-address-change-request',
        component: StudentAddressChangeRequestComponent,
        pathMatch: 'full',
      },
      {
        path: 'student-mobile-number-update',
        component: StudentMobileNumberUpdateComponent,
        pathMatch: 'full',
      },
      {
        path: 'student-category-change',
        component: StudentCategoryChangeComponent,
        pathMatch: 'full',
      },
      {
        path: 'student-name-correction',
        component: StudentNameCorrectionComponent,
        pathMatch: 'full',
      },
      {
        path: 'src-report',
        component: SrcReportComponent,
        pathMatch: 'full',
      },
      {
        path: 'src-report-by-student',
        component: SrcReportByStudentComponent,
        pathMatch: 'full',
      },
      {
        path: 'src-esign',
        component: SrcEsignComponent,
        pathMatch: 'full',
      },
      {
        path: 'promote-even-sem',
        component: PromoteEvenSemesterComponent,
        pathMatch: 'full',
      },
      {
        path: 'pdc-report',
        component: PdcReportComponent,
        pathMatch: 'full',
      },
      {
        path: 'pdc-generate',
        component: PdcGenerateComponent,
        pathMatch: 'full',
      },
      {
        path: 'pdc-esign',
        component: PdcEsignComponent,
        pathMatch: 'full',
      },
      {
        path: 'transcript-report',
        component: TranscriptReportComponent,
        pathMatch: 'full',
      },
      {
        path: 'transcript-generate',
        component: TranscriptGenerateComponent,
        pathMatch: 'full',
      },
      {
        path: 'transcript-esign',
        component: TranscriptEsignComponent,
        pathMatch: 'full',
      },
      {
        path: 'student-address-change-request',
        component: StudentAddressChangeRequestComponent,
        pathMatch: 'full',
      },
      {
        path: 'student-basic-details-update',
        component: StudentBasicDetailsUpdateComponent,
        pathMatch: 'full',
      },
      {
        path: 'registration-report',
        component: RegistrationReportComponent,
        pathMatch: 'full',
      },
      {
        path: 'exam-time-table',
        component: ExamTimeTableComponent,
        pathMatch: 'full',
      },
      {
        path: 'exam-time-table-report',
        component: ExamTimeTableReportComponent,
        pathMatch: 'full',
      },
      // { path: 'student-corner', loadChildren: () => import('./student-corner/student-corner.module').then(m => m.StudentCornerModule) },
    ]
  },
  {
    path: 'update',
    component: UpdateRoutesComponent
  },

  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
