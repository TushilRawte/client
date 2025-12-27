import { Component } from '@angular/core';
import { HttpService, AlertService ,AuthService } from 'shared';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-registration',
  standalone: false,
  templateUrl: './course-registration.component.html',
  styleUrl: './course-registration.component.scss',
})
export class CourseRegistrationComponent {
  registeredCourseTemp: any[] = [];
  regularCourseTemp: any[] = [];
  failedCourseTemp: any[] = [];
  selectedCourses: any[] = []; // & for storing selected courses
  onSelectDropCourse: any; // & for storing dropdown selected course
  courseFromAllotment: any[] = [];
  otherCourseFromAllotment: any[] = [];
  registeredCourseList: any[] = [];
  failedCoursesList: any[] = [];
  optionalCoursesList: any[] = [];
  studentData: any = null;
  userData: any = {};

//tushil
  constructor(
    private HTTP: HttpService,
    private alert: AlertService,
    private router: Router,
    private auth: AuthService,
  ) { this.userData = this.auth.getSession()}

  tableOptions: any = {
    is_read: true,
    listLength: 0,
    dataSource: [],
    button: [],
    title: 'Courses List',
  };


  ngOnInit(): void {
    this.getStudentDetails();
  }

  getStudentDetails() {
    const params = {
       academic_session_id: this.userData?.academic_session_id,
      course_year_id: this.userData?.course_year_id,
      semester_id: this.userData?.semester_id,
      college_id: this.userData?.college_id,
      degree_programme_id: this.userData.degree_programme_id,
      ue_id: this.userData.user_id,
      payment: true,
    };
    this.HTTP.getParam(
      '/course/get/getStudentList/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.studentData = !result.body.error ? result.body.data[0] : [];


      if (!this.studentData) return;
      const {
        registration_status_id,
        course_failed_type,
        course_regular_type,
        course_year_id,
        stu_acad_status_id,
        is_finalize_yn
      } = this.studentData;

      // --- Case 1: Already registered ---
      if (registration_status_id === 1 && is_finalize_yn === 'Y') {
        this.getRegisteredCourses();
      } if(registration_status_id === 1 && is_finalize_yn === 'N'){
        this.getRegisteredCourses();
        if (stu_acad_status_id !== 3) {
          this.getOtherCourseFromAllotment();
        }
      }
       else{
        // --- Case 2: Not registered yet ---
        let shouldLoadAllotment = false;

        // Failed courses
        if (course_failed_type === 'Y') {
          if (course_year_id !== 2) {
            this.getFailedCourse();
          } else {
            shouldLoadAllotment = true; // failed in final year
          }
        }

        // Regular courses
        if (course_regular_type === 'Y') {
          shouldLoadAllotment = true;
        }

        // Only call once if needed
        if (shouldLoadAllotment) {
          this.getCourseFromAllotment();
        }
      }
    });
  }

  getRegisteredCourses() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
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
      this.registeredCourseTemp = this.registeredCourseList;
      this.tryUpdateSelectedCourses();
    });
  }

  // ^ course list for registration
  getCourseFromAllotment() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      dean_committee_id:this.studentData?.dean_committee_id
    };
    this.HTTP.getParam(
      '/course/get/getCourseFromAllotment/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.courseFromAllotment = !result.body.error ? result.body.data : [];
      if(this.studentData?.registration_status_id == 1){
        this.regularCourseTemp = this.courseFromAllotment;
      }
      else{
      this.optionalCoursesList = this.courseFromAllotment.filter(course => course?.cou_allot_type_name_e === 'Optional')
      this.regularCourseTemp = this.courseFromAllotment.filter(course => course?.cou_allot_type_name_e !== 'Optional');
      }
      this.tryUpdateSelectedCourses();
      if (this.studentData?.stu_acad_status_id !== 3) {
          this.getOtherCourseFromAllotment();
      }
    });
  }

  getFailedCourse() {
    const paramsForFailed = {
      academic_session_id: this.studentData?.academic_session_id - 1,
      semester_id: this.studentData?.semester_id,
      ue_id: this.studentData?.ue_id,
    };
    const paramsForTeacher = {
      academic_session_id: this.studentData?.academic_session_id - 1,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      dean_committee_id: this.studentData?.dean_committee_id,
    };

    // ^ First, get the failed courses
    this.HTTP.getParam(
      '/course/get/getFailedCoursesForReg/',
      paramsForFailed,
      'academic'
    ).subscribe((failedRes: any) => {
      const failedCoursesList = !failedRes.body.error
        ? failedRes.body.data
        : [];

      // Then get the teacher data
      this.HTTP.getParam(
        '/master/get/getCourseForUpdate/',
        paramsForTeacher,
        'academic'
      ).subscribe((teacherRes: any) => {
        const teacherdata = !teacherRes.body.error
          ? teacherRes.body.data.courserows
          : [];

        // Map failed courses and add teacher_name
        this.failedCourseTemp = failedCoursesList.map((c: any) => {
          const teacher = teacherdata.find(
            (t: any) => t.course_id === c.course_id
          );

          return {
            ...c,
            cou_allot_type_name_e: 'Complusory',
            teacher_name: teacher ? teacher.teacherRows?.emp_name : 'N/A',
          };
        });

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
      const normalizedCourses = this.registeredCourseTemp.map((c) =>
        c.course_registration_type_id === 2
          ? { ...c, cou_allot_type_name_e: 'Complusory' }
          : c
      );
      const sortedRegisteredCourses = normalizedCourses
        .map((c) => this.adjustCreditsForRegisterd(c))
        .sort((a, b) => {
          // First priority: registration_type_id == 2 goes on top
          if (
            a.course_registration_type_id === 2 &&
            b.course_registration_type_id !== 2
          )
            return -1;
          if (
            b.course_registration_type_id === 2 &&
            a.course_registration_type_id !== 2
          )
            return 1;

          // Second priority: Complusory before Optional
          if (
            a.cou_allot_type_name_e === 'Complusory' &&
            b.cou_allot_type_name_e === 'Optional'
          )
            return -1;
          if (
            a.cou_allot_type_name_e === 'Optional' &&
            b.cou_allot_type_name_e === 'Complusory'
          )
            return 1;

          return 0; // keep original order otherwise
        });

      const regularCoursesWithType = this.regularCourseTemp.map((c) =>
        this.mapRegularCourse(c)
      );

     

      const failedCoursesWithType = this.failedCourseTemp.map((c) =>
        this.mapFailedCourse(c)
      );
      this.selectedCourses = [
        ...sortedRegisteredCourses,
        ...regularCoursesWithType,
        ...failedCoursesWithType
      ];
      this.tableOptions.dataSource = this.selectedCourses;
      this.tableOptions.listLength = this.selectedCourses.length;
    }
  }

  private adjustCreditsForRegisterd(c: any) {
    let [theory, practical] = c.credit.split('+').map(Number);

    if (c?.course_nature_id === 1) practical = 0;
    else if (c?.course_nature_id === 2) theory = 0;

    return {
      ...c,
      credit: `${theory}+${practical}`,
    };
  }

  private mapRegularCourse(c: any) {
    return {
      ...c,
      course_registration_type_id: 1,
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
    };
  }

  private mapFailedCourse(c: any) {
    let [theory, practical] = c.credit.split('+').map(Number);

    if (c?.course_nature_id === 1) practical = 0;
    else if (c?.course_nature_id === 2) theory = 0;

    return {
      ...c,
      credit: `${theory}+${practical}`,
      course_registration_type_id: 2,
      academic_session_id: this.studentData?.academic_session_id - 1,
      course_year_id: this.studentData?.course_year_id - 1,
    };
  }

  getOtherCourseFromAllotment() {
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      college_id: this.studentData?.college_id,
      semester_id: this.studentData?.semester_id,
      not_degree_programme_id: this.studentData?.degree_programme_id,
      degree_programme_id_not: true,
      dean_committee_id:this.studentData?.dean_committee_id
    };
    this.HTTP.getParam(
      '/course/get/getCourseFromAllotment/',
      params,
      'academic'
    ).subscribe((result: any) => {
      const apiData = !result.body.error
        ? result.body.data
        : [];
        this.otherCourseFromAllotment = [
      ...apiData,
      ...this.optionalCoursesList
    ];
    });
    
  }

  selectedCourseId: number | null = null;

  onCourseSelect(course: any) {
    this.onSelectDropCourse = course;
  }

  async onCourseAdd(courseSelect: NgSelectComponent) {
    const selectedCourse = this.onSelectDropCourse;

    if (!selectedCourse) {
      // Early return if no course is selected
      return;
    }

    const alreadyExists = this.selectedCourses.some(
      (sc) =>
        sc.course_id === selectedCourse.course_id

      /* sc.course_id === selectedCourse.course_id &&
      sc.course_nature_id === selectedCourse.course_nature_id */
    );

    const canProceed = await this.canSelectOptionalCourse();
    if (!canProceed) {
      return;
    }


    if (!alreadyExists) {
      const updatedCourse = {
        ...selectedCourse,
        other_department: true,
        course_registration_type_id: 1,
        cou_allot_type_id: 2,
        course_year_id:this.userData?.course_year_id
      };
      this.selectedCourses.push(updatedCourse);
      console.log(this.selectedCourses);
      this.tableOptions = {
        ...this.tableOptions,
        dataSource: [...this.selectedCourses],
        listLength: this.selectedCourses.length
      };

      courseSelect.clearModel();
    } else {
      this.alert.alertMessage('info', 'course already selected', 'info')
    }
  }

  onCourseRemove(courseId: number, courseNatureId: number) {
    this.selectedCourses = this.selectedCourses.filter(
      (course) =>
        !(
          course.course_id === courseId
        )

      /* !(
        course.course_id === courseId &&
        course.course_nature_id === courseNatureId
      ) */
    );

    this.tableOptions = {
      ...this.tableOptions,
      dataSource: [...this.selectedCourses],
      listLength: this.selectedCourses.length
    };
    // console.log("after", this.selectedCourses);

  }

  isFailedCourse(course: any): boolean {
    if (this.failedCourseTemp.length > 0) {
      return this.failedCourseTemp.some((f) => f.course_id == course.course_id);
    } else {
      return false;
    }
  }

  async canSelectOptionalCourse(): Promise<boolean> {

    // Condition check  
    if (
      this.studentData?.dean_committee_id === 8 &&
      this.studentData?.degree_programme_type_id === 1
    ) {
      const optionalAlreadySelected = this.selectedCourses.some(
        (course: any) => course?.cou_allot_type_name_e === 'Optional'
      );


      if (optionalAlreadySelected) {
        await this.alert.alertMessage(
          'Info',
          'You can select only one optional course',
          'info'
        );
        return false; // ❌ stop further execution
      }
    }

    return true; // ✅ allow execution
  }

  async OnlyOneSelectOptionalCourse(): Promise<boolean> {
    if (
      this.studentData?.dean_committee_id === 8 &&
      this.studentData?.degree_programme_type_id === 1
    ) {
      const optionalAlreadySelected = this.selectedCourses.some(
        (course: any) => course?.cou_allot_type_name_e === 'Optional'
      );

      if (!optionalAlreadySelected) {
        await this.alert.alertMessage(
          'Info',
          'You have to select at least one optional course',
          'info'
        );
        return false; 
      }
    }

    return true; // ✅ allow execution
  }

 async onSubmit() {
 const payload = this.payloadForReg();
 console.log(payload);
 
    const canProceed = await this.OnlyOneSelectOptionalCourse();
    if (!canProceed) {
      return;
    }
    
    this.alert.confirmAlert(
      'Are you sure?',
      'Do you want to register the courses?',
      'info'
    ).then((result: any) => {

      if (result.isConfirmed) {
        this.saveData();
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        this.alert.alertMessage(
          'Cancelled',
          'Your courses were not submitted.',
          'info'
        );
      }
    });
  }

  async onUpdate() {
    const canProceed = await this.OnlyOneSelectOptionalCourse();
    if (!canProceed) {
      return;
    }

    this.alert.confirmAlert(
    'Are you sure?',
    'Do you want to update the registerd courses?',
    'info'
  ).then((result:any) => {

    if (result.isConfirmed) {
      this.updateData();
    } else if (result.dismiss === Swal.DismissReason.cancel) {

      this.alert.alertMessage(
        'Cancelled',
        'You have not update the registerd courses',
        'info'
      );

    }
  });
  }

  onFinalize() {
    this.alert.confirmAlert(
      'Are you sure?',
      'Do you want to Finalize the registerd courses?',
      'info'
    ).then((result: any) => {

      if (result.isConfirmed) {
        this.finalizeData();
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        this.alert.alertMessage(
          'Cancelled',
          'You have not Finalize the registerd courses',
          'info'
        );

      }
    });
  }

  saveData() {
    if (this.studentData?.registration_id) {
      const payload = this.payloadForReg();

      this.HTTP.postData(
        '/course/post/saveStudentCourseRegistration',
        payload,
        'academic'
      ).subscribe((res: any) => {
        if (!res.body.error) {
          this.registeredCourseTemp.length = 0;
          this.regularCourseTemp.length = 0;
          this.failedCourseTemp.length = 0;
          this.getStudentDetails();
          this.alert.alert(false,'Submitted!');
        } else {
          this.alert.alertMessage(
            'Something went wrong!',
            res.body.error?.message || 'Unknown error',
            'warning'
          );
        }
      });
    }
  }

  updateData() {
    const payload = this.payloadForReg();
    this.HTTP.putData(
      '/course/update/updateStudentCourseRegistration',
      payload,
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        this.registeredCourseTemp.length = 0;
        this.regularCourseTemp.length = 0;
        this.failedCourseTemp.length = 0;
        this.getStudentDetails();
         this.alert.alert(false,'Updated!');
      } else {
        this.alert.alertMessage(
          'Something went wrong!',
          res.body.error?.message,
          'warning'
        );
      }
    });
  }

  finalizeData() {
    const payload = this.payloadForReg();
    this.HTTP.putData(
      '/course/update/finalizeCourseRegistration',
      {registration_id:payload.registration_id},
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        this.registeredCourseTemp.length = 0;
        this.regularCourseTemp.length = 0;
        this.failedCourseTemp.length = 0;
        this.getStudentDetails();
        this.alert.alert(false, 'Updated!');
      } else {
        this.alert.alertMessage(
          'Something went wrong!',
          res.body.error?.message,
          'warning'
        );
      }
    });
  }

  private buildCoursePayload(course: any, course_nature_id: string) {
    return {
      course_id: course.course_id,
      course_type_id: course.course_type_id,
      course_nature_id, // "1" = Theory, "2" = Practical
      course_registration_type_id: course.course_registration_type_id,
      course_year_id: course.course_year_id,
      academic_session_id: course.academic_session_id,
    };
  }

  private payloadForReg() {
    return {
      semester_id: this.studentData?.semester_id,
      registration_id: this.studentData?.registration_id,
      courses: this.selectedCourses.flatMap((course) => {
        const [theory, practical] = course.credit.split('+').map(Number);

        const result: any[] = [];

        if (theory > 0) {
          result.push(this.buildCoursePayload(course, '1')); // Theory
        }

        if (practical > 0 && practical < 15) {
          result.push(this.buildCoursePayload(course, '2')); // Practical
        } else if (practical >= 15) {
          result.push(this.buildCoursePayload(course, '3')); // thises
        }
        return result;
      }),
    };
  }
}
