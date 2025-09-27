import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService, AlertService } from 'shared';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exam-services',
  standalone: false,
  templateUrl: './exam-services.component.html',
  styleUrl: './exam-services.component.scss',
})
export class ExamServicesComponent {
  studentData: any = null;
  sessionData: any = {};
  stdApplyForm!: FormGroup;
  registeredCourseList: any[] = [];
  selectedCourses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private HTTP: HttpService,
    private alert: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    const storedData = sessionStorage.getItem('studentData');
    if (storedData) {
      const studentData = JSON.parse(storedData);
      this.sessionData = studentData;
      this.mainforfun();
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  mainforfun() {
    this.stdApplyForm = this.fb.group({});
    this.getStudentDetails();
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
      this.getRegisteredCourses();
    });
  }

  getRegisteredCourses() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      ue_id: this.studentData?.ue_id,
    };
    this.HTTP.getParam(
      '/course/get/getRegisteredCourseList/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.registeredCourseList = !result.body.error ? result.body.data : [];
    });
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

  isSelected(course: any): boolean {
    return this.selectedCourses.includes(course);
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
    console.log(this.selectedCourses);
    console.log('final payload', payload);
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
      revaluation_main_id: 8,
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

  
}
