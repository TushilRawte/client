import { Component } from '@angular/core';
import { HttpService, AlertService } from 'shared';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedExamService } from '../../../../services/shared-exam.service';

@Component({
  selector: 'app-exam-services',
  standalone: false,
  templateUrl: './exam-services.component.html',
  styleUrl: './exam-services.component.scss',
})
export class ExamServicesComponent {
  studentData: any = null;
  sessionData: any = {};
  selectedCourses: any[] = [];
  coursesListAndMarks: any[] = [];
  appliedCoursesListAndMarks: any[] = [];

  constructor(
    private HTTP: HttpService,
    private alert: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private sharedExamService: SharedExamService
  ) {}

  tableOptions: any = {
    is_read: true,
    listLength: 0,
    dataSource: [],
    button: [],
    title: 'Courses List',
  };

  ngOnInit() {
    const storedData = sessionStorage.getItem('studentData');
    if (storedData) {
      const studentData = JSON.parse(storedData);
      this.sessionData = studentData;
      this.getStudentDetails();
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  getStudentDetails() {
    // ^ this data will get from login session
    const academic_session_id = this.sessionData?.academic_session_id;
    const course_year_id = this.sessionData?.course_year_id;
    const semester_id = this.sessionData?.semester_id;
    const college_id = this.sessionData?.college_id;
    const degree_programme_id = this.sessionData?.degree_programme_id;
    const ue_id = this.sessionData?.ue_id;

    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id,
    };
    this.HTTP.getParam(
      '/course/get/getStudentList/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.studentData = !result.body.error ? result.body.data[0] : [];
      this.getMarksForRevalRetotalApply();
    });
  }

  getAppliedCourseList() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      student_master_id: this.studentData?.ue_id,
    };
    this.HTTP.getParam(
      '/course/get/getAppliedCourseList/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.appliedCoursesListAndMarks = !result.body.error
        ? result.body.data
        : [];
      if (this.appliedCoursesListAndMarks.length > 0) {
        const appliedIds = this.appliedCoursesListAndMarks.map(
          (a) => a.course_id
        );
        this.selectedCourses = this.coursesListAndMarks.filter((c) =>
          appliedIds.includes(c.course_id)
        );
      }
    });
  }

  getMarksForRevalRetotalApply() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      semester_id: this.studentData?.semester_id,
      course_semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      ue_id: this.studentData?.ue_id,
    };
    this.HTTP.getParam(
      '/course/get/getMarksForRevalRetotalApply/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.coursesListAndMarks = !result.body.error ? result.body.data : [];
      this.tableOptions.dataSource = this.coursesListAndMarks;
      this.tableOptions.listLength = this.coursesListAndMarks.length;
      this.getAppliedCourseList();
    });
  }

  onCheckboxClick(course: any, event: MouseEvent) {
    if (
      (this.selectedCourses.length >= 2 && !this.isSelected(course)) ||
      course.eligible_yn === 'N'
    ) {
      this.snackBar.open(
        course.eligible_yn === 'N'
          ? 'This course is not eligible.'
          : 'You can only select up to 2 courses.',
        'Close',
        { duration: 3000 }
      );
    } 
  }

  onRowCheck(course: any, event: any) {
    if (event.checked) {
      // Add if not already in array
      this.selectedCourses.push(course);
    } else {
      // Remove if unchecked
      this.selectedCourses = this.selectedCourses.filter((c) => c !== course);
    }
  }

  isApplied(course: any): boolean {
    return this.appliedCoursesListAndMarks?.some(
      (a) => a.course_id === course.course_id
    );
  }

  isSelected(course: any): boolean {
    return this.selectedCourses?.some((a) => a.course_id === course.course_id);
  }

  onSubmit() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to apply for selected courses?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveData();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your have Cancelled it .', 'info');
      }
    });
  }

  saveData() {
    const payload = this.payloadForExamService();
    this.HTTP.postData(
      '/course/post/saveStudentExamServices',
      payload,
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        this.getStudentDetails();
        Swal.fire('Submitted!', 'Your data has been submitted.', 'success');
      } else {
        this.alert.alertMessage(
          'Something went wrong!',
          res.body.error?.message,
          'warning'
        );
      }
    });
  }

  onUpdate() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update the selected courses?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateData();
      }
    });
  }

  updateData() {
    const payload = {
      revaluation_main_id:
        this.appliedCoursesListAndMarks[0]?.revaluation_main_id,
      courses: this.selectedCourses,
    };
    this.HTTP.putData(
      '/course/update/updateStudentExamServices',
      payload,
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        Swal.fire(
          'Submitted!',
          'Your selected courses has been updated.',
          'success'
        );
      } else {
        this.alert.alertMessage(
          'Something went wrong!',
          res.body.error?.message,
          'warning'
        );
      }
    });
  }

  private payloadForExamService() {
    return {
      revaluation_type_id: 1,
      academic_session_id: this.studentData?.academic_session_id,
      ue_id: this.studentData?.ue_id,
      student_master_id: this.studentData?.ue_id,
      college_id: this.studentData?.college_id,
      dean_committee_id: this.studentData?.dean_committee_id,
      current_course_year_id: this.studentData?.course_year_id,
      current_semester_id: this.studentData?.semester_id,
      applied_course_year_id: this.selectedCourses[0]?.course_year_id,
      applied_semester_id: this.selectedCourses[0]?.semester_id,
      applied_academic_session_id: this.selectedCourses[0]?.academic_session_id,
      courses: this.selectedCourses,
    };
  }

  goToPayment() {
    const examData = {
      appliedCourseYear: this.selectedCourses[0]?.course_year_id,
      appliedSemester: this.selectedCourses[0]?.semester_id,
      appliedAcademic: this.selectedCourses[0]?.academic_session_id,
      no_of_subject:this.selectedCourses.length,
      reval_id : 1
    };
    this.sharedExamService.setExamData(examData);
    this.router.navigate(['payment'], { relativeTo: this.route });
  }

}
