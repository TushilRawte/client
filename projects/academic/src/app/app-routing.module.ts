import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, LayoutComponent, NotFoundComponent, UpdateRoutesComponent } from 'shared';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
import { CourseAllotmentComponent } from './course-allotment/course-allotment.component';
import { CourseallotDashboardComponent } from './courseallot-dashboard/courseallot-dashboard.component';
import { CourseFinalizeComponent } from './course-finalize/course-finalize.component';
import { TeacherAllotmentComponent } from './teacher-allotment/teacher-allotment.component';
import { CourseRegistrationComponent } from './registration/course-registration/course-registration.component';
import { CourseRegistrationUnfinlizeComponent } from './course-registration-unfinlize/course-registration-unfinlize.component';
import { StudentSectionAllotmentComponent } from './student-section-allotment/student-section-allotment.component';
import { CourseAttendanceComponent } from './attendance/course-attendance/course-attendance.component';
import { CourseAttendanceReportComponent } from './attendance/course-attendance-report/course-attendance-report.component';
import { MarksEntryFacultyComponent } from './marks entry/marks-entry-faculty/marks-entry-faculty.component';
import { MarksEntryImportComponent } from './marks entry/marks-entry-import/marks-entry-import.component';
import { MarksEntryAdminComponent } from './marks entry/marks-entry-admin/marks-entry-admin.component';
import { MarksEntryUnfinalizeComponent } from './marks entry/marks-entry-unfinalize/marks-entry-unfinalize.component';
import { MarksEntryThesisComponent } from './marks entry/marks-entry-thesis/marks-entry-thesis.component';
import { MarksEntryThesisUnfinalizeComponent } from './marks entry/marks-entry-thesis-unfinalize/marks-entry-thesis-unfinalize.component';
import { MarksEntryExportComponent } from './marks entry/marks-entry-export/marks-entry-export.component';
import { GenerateUidnComponent } from './student-profile/generate-uidn/generate-uidn.component';
import { SrcGenerateComponent } from './semester-report-card/src-generate/src-generate.component';
import { AutomaticRegistrationComponent } from './registration/automatic-registration/automatic-registration.component';
import { PaymentSettlementComponent } from './payment-settlement/payment-settlement.component';
import { FacultyListComponent } from './registration/faculty-list/faculty-list.component';
import { ResultNotificationComponent } from './marks entry/result-notification/result-notification.component';
import { StudentPasswordResetComponent } from './student/student-password-reset/student-password-reset.component';
import { StudentMobileNumberUpdateComponent } from './student/student-mobile-number-update/student-mobile-number-update.component';
import { StudentCategoryChangeComponent } from './student/student-category-change/student-category-change.component';
import { StudentNameCorrectionComponent } from './student/student-name-correction/student-name-correction.component';
import { GetSrcListComponent } from './student/get-src-list/get-src-list.component';
import { StudentAddressChangeRequestComponent } from './student/student-address-change-request/student-address-change-request.component';
import { ApproveUidnComponent } from './student-profile/approve-uidn/approve-uidn.component';
import { PromoteEvenSemesterComponent } from './student-academic-status/promote-even-semester/promote-even-semester.component';
import { MarksEntryPracticalComponent } from './marks entry/marks-entry-practical/marks-entry-practical.component';
import { MarksEntryInternalPracticalComponent } from './marks entry/marks-entry-internal-practical/marks-entry-internal-practical.component';
import { MarksEntryAbsentComponent } from './marks entry/marks-entry-absent/marks-entry-absent.component';

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
        path: 'new',
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
        path: 'get-src-list',
        component: GetSrcListComponent,
        pathMatch: 'full',
      },
      {
        path: 'promote-even-sem',
        component: PromoteEvenSemesterComponent,
        pathMatch: 'full',
      },
       {
        path: 'marks-entry-practical',
        component: MarksEntryPracticalComponent,
        pathMatch: 'full',
      },
        {
        path: 'marks-entry-internal-practical',
        component: MarksEntryInternalPracticalComponent,
        pathMatch: 'full',
      },
       {
        path: 'marks-entry-absent',
        component: MarksEntryAbsentComponent,
        pathMatch: 'full',
      },
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
