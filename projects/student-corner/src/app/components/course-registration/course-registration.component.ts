import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService, AlertService } from 'shared';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-course-registration',
  standalone: false,
  templateUrl: './course-registration.component.html',
  styleUrl: './course-registration.component.scss'
})
export class CourseRegistrationComponent {

  registeredCourseTemp: any[] = [];
  regularCourseTemp: any[] = [];
  failedCourseTemp: any[] = [];
  selectedCourses: any[] = []; // & for storing selected courses
  onSelectDropCourse: any;  // & for storing dropdown selected course 
  courseRegistrationForm!: FormGroup;
  courseFromAllotment: any[] = [];
  otherCourseFromAllotment: any[] = [];
  registeredCourseList: any[] = [];
  failedCoursesList: any[] = [];
  studentData: any;
  sessionData: any = {};



  constructor(private snackBar: MatSnackBar, private fb: FormBuilder, private HTTP: HttpService, private alert: AlertService, private router: Router) { }

  ngOnInit() {
    const storedData = sessionStorage.getItem('studentData');
    if (storedData) {
      const studentData = JSON.parse(storedData);
      this.sessionData = studentData
      this.getStudentDetails();
      this.mainforfun();
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  mainforfun() {
    this.courseRegistrationForm = this.fb.group({
    });
  }

  getStudentDetails() {
    // ^ this data will get from login session
    const academic_session_id = this.sessionData.academic_session_id;
    const course_year_id = this.sessionData.course_year_id;
    const semester_id = this.sessionData.semester_id;
    const college_id = this.sessionData.college_id;
    const degree_programme_id = this.sessionData.degree_programme_id;
    const ue_id = this.sessionData.ue_id;

    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id
    }
    this.HTTP.getParam('/course/get/getStudentList/', params, 'academic').subscribe((result: any) => {
      this.studentData = !result.body.error ? result.body.data[0] : [];

      if (this.studentData) {
        if (this.studentData?.registration_status_id === 1) {
          this.getRegisteredCourses();
        }else if (this.studentData?.course_regular_type == 'Y') {
          this.getCourseFromAllotment();
        }
        if (this.studentData?.course_failed_type == 'Y') {
          this.getFailedCourse();
        } else {
          this.getOtherCourseFromAllotment();
        }

      }
    })
  }

  getRegisteredCourses() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      ue_id: this.studentData?.ue_id
    }
    this.HTTP.getParam('/course/get/getRegisteredCourseList/', params, 'academic').subscribe((result: any) => {
      this.registeredCourseList = !result.body.error ? result.body.data : [];
      this.registeredCourseTemp = this.registeredCourseList;
      this.tryUpdateSelectedCourses();

    })
  }

  // course list for registration 
  getCourseFromAllotment() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      degree_programme_id: this.studentData?.degree_programme_id,
    }
    this.HTTP.getParam('/course/get/getCourseFromAllotment/', params, 'academic').subscribe((result: any) => {
      this.courseFromAllotment = !result.body.error ? result.body.data : []
      this.regularCourseTemp = this.courseFromAllotment;
      this.tryUpdateSelectedCourses();
    })
  }

  getFailedCourse() {
    const paramsForFailed = {
      academic_session_id: this.studentData?.academic_session_id - 1,
      semester_id: this.studentData?.semester_id,
      ue_id: this.studentData?.ue_id
    };
    const paramsForTeacher = {
      academic_session_id: this.studentData?.academic_session_id - 1,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      dean_committee_id: this.studentData?.dean_committee_id
    };

    // First, get the failed courses
    this.HTTP.getParam('/course/get/getFailedCoursesForReg/', paramsForFailed, 'academic').subscribe((failedRes: any) => {
      const failedCoursesList = !failedRes.body.error ? failedRes.body.data : [];

      // Then get the teacher data
      this.HTTP.getParam('/master/get/getCourseForUpdate/', paramsForTeacher, 'academic').subscribe((teacherRes: any) => {
        const teacherdata = !teacherRes.body.error ? teacherRes.body.data.courserows : [];

        // Map failed courses and add teacher_name
        this.failedCourseTemp = failedCoursesList.map((c: any) => {
          const teacher = teacherdata.find((t: any) => t.course_id === c.course_id);

          return {
            ...c,
            cou_allot_type_name_e: 'Complusory',
            teacher_name: teacher ? teacher.teacherRows?.emp_name : 'N/A'
          };
        });

        console.log('this is teacher data', this.failedCourseTemp);
        this.tryUpdateSelectedCourses();
      });
    });
  }


  tryUpdateSelectedCourses() {
    if (
      this.registeredCourseTemp.length ||
      this.regularCourseTemp.length ||
      this.failedCourseTemp.length
    ) {
    // Sort registeredCourseTemp: compulsory first, then optional
    const sortedRegisteredCourses = [
      ...this.registeredCourseTemp.filter(c => c.cou_allot_type_name_e === 'Complusory'),
      ...this.registeredCourseTemp.filter(c => c.cou_allot_type_name_e === 'Optional')
    ];

    this.selectedCourses = [
      ...sortedRegisteredCourses,
      ...this.regularCourseTemp,
      ...this.failedCourseTemp
    ];
  }
}



  getOtherCourseFromAllotment() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      college_id: this.studentData?.college_id,
      semester_id: this.studentData?.semester_id,
      not_degree_programme_id: this.studentData?.degree_programme_id,
      degree_programme_id_not: true
    }
    this.HTTP.getParam('/course/get/getCourseFromAllotment/', params, 'academic').subscribe((result: any) => {
      this.otherCourseFromAllotment = !result.body.error ? result.body.data : [];
    })
  }


  selectedCourseId: number | null = null;

  onCourseSelect(course: any) {
    this.onSelectDropCourse = course
  }

  onCourseAdd(courseSelect: NgSelectComponent) {
    const alreadyExists = this.selectedCourses.some(sc => sc.course_id === this.onSelectDropCourse?.course_id);
    if (!alreadyExists) {
      this.selectedCourses.push(this.onSelectDropCourse);
      courseSelect.clearModel()
    } else {
      const snackRef = this.snackBar.open(
        `${this.onSelectDropCourse?.course_name} course already selected`,
        'Close',
          {
      duration: 3000,
    }
      );
      snackRef.onAction().subscribe(() => {
        console.log('Snackbar action button clicked');
        courseSelect.clearModel();
      });

    }

  }

  onCourseRemove(courseId: any) {
    console.log(courseId);
    this.selectedCourses = this.selectedCourses.filter(id => id.course_id !== courseId);
    console.warn(this.selectedCourses);
  }

isFailedCourse(course: any): boolean {
  if (this.failedCourseTemp.length > 0) {
    return this.failedCourseTemp.some(f => f.course_id == course.course_id);
  } else {
    return false; 
  }
}



onSubmit() {
  Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to register the courses?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, submit it!',
    cancelButtonText: 'No, cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.saveData();
      Swal.fire('Submitted!', 'Your data has been submitted.', 'success');
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire('Cancelled', 'Your courses was not submitted.', 'info');
    }
  });
}




onUpdate() {
  Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to update the registerd courses?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, submit it!',
    cancelButtonText: 'No, cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.updateData();
      Swal.fire('Submitted!', 'Your registerd courses has been updated.', 'success');
    }
  });
}

  saveData() {
    console.warn(this.selectedCourses);
    if (this.studentData?.registration_id) {
      const payload = {
        academic_session_id: this.studentData?.academic_session_id,
        course_year_id: this.studentData?.course_year_id,
        semester_id: this.studentData?.semester_id,
        registration_id: this.studentData?.registration_id,
        courses: this.selectedCourses.map(course => ({
          course_id: course.course_id,
          course_type_id: course.course_type_id,
          course_nature_id: course.course_nature_id,
        }))
      };

      console.log('Sending payload to API:', payload);

      this.HTTP.postData('/course/post/saveStudentCourseRegistration', payload, 'academic').subscribe(
        (res: any) => {
          console.log('Response from Saved API:', res);

          if (!res.body.error) {
            this.alert.alertMessage("Record Saved...!", "", "success");
            this.router.navigateByUrl('/dashboard')
          } else {
            this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
          }
        }
      );
    }

  }


  updateData() {
    const payload = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      registration_id: this.studentData?.registration_id,
      courses: this.selectedCourses.map(course => ({
        course_id: course.course_id,
        course_type_id: course.course_type_id,
        course_nature_id: course.course_nature_id,
      }))
    };

    console.log('Sending payload to update API:', payload);

    this.HTTP.putData('/course/update/updateStudentCourseRegistration', payload, 'academic').subscribe(
      (res: any) => {
        console.log('Response from update API:', res);

        if (!res.body.error) {
          this.alert.alertMessage("Record Updated...!", "", "success");
          this.getRegisteredCourses();
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      }
    );
    this.getRegisteredCourses();
  }



}
