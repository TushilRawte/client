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
import { ApproveUidnComponent } from './student-profile/approve-uidn/approve-uidn.component';

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
