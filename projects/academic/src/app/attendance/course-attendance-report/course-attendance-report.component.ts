import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-course-attendance-report',
  standalone: false,
  templateUrl: './course-attendance-report.component.html',
  styleUrl: './course-attendance-report.component.scss'
})
export class CourseAttendanceReportComponent implements OnInit, OnDestroy {
  state = {
    matrixList: [] as any[],
    acadmcSesnList: [] as any[],
    degreeProgrammeTypeList: [] as any[],
    collegeList: [] as any[],
    semesterList: [] as any[],
    courseList: [] as any[],
  }
  courseAttendanceReportFormGroup!: FormGroup;
  private destroy$ = new Subject<void>();

  @Input() options: any; // PDF or Print options
  @ViewChild('print_content') print_content!: ElementRef;

  ngOnInit(): void {
    this.getAcademicSession();

    this.courseAttendanceReportFormGroup.get('selection.academic_session_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(academicSessionId => {
        this.clearState(['semesterList', 'degreeProgrammeTypeList', 'collegeList', 'courseList', 'matrixList', 'courseList']);
        this.resetFormFields([
          'selection.semester_id',
          'selection.degree_programme_type_id',
          'selection.college_id',
          'courseDetail.course_nature_id',
          'courseDetail.exam_type_id',
          'courseDetail.dean_committee_id',
          'courseDetail.course_year_id',
          'courseDetail.course_id'
        ]);

        if (academicSessionId) {
          this.getSemesterData();
        }
      });

    this.courseAttendanceReportFormGroup.get('selection.semester_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(semesterId => {
        this.clearState(['degreeProgrammeTypeList', 'collegeList', 'courseList', 'matrixList', 'courseList']);
        this.resetFormFields([
          'selection.degree_programme_type_id',
          'selection.college_id',
          'courseDetail.course_nature_id',
          'courseDetail.exam_type_id',
          'courseDetail.dean_committee_id',
          'courseDetail.course_year_id',
          'courseDetail.course_id'
        ]);

        if (semesterId) {
          this.getDegreeProgrammeTypeData();
        }
      });

    this.courseAttendanceReportFormGroup.get('selection.degree_programme_type_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeTypeId => {
        this.clearState(['collegeList', 'courseList', 'matrixList', 'courseList']);
        this.resetFormFields([
          'selection.college_id',
          'courseDetail.course_nature_id',
          'courseDetail.exam_type_id',
          'courseDetail.dean_committee_id',
          'courseDetail.course_year_id',
          'courseDetail.course_id'
        ]);

        if (degreeProgrammeTypeId) {
          this.getCollegeData(degreeProgrammeTypeId);
        }
      });

    this.courseAttendanceReportFormGroup.get('selection.college_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeTypeId => {
        this.clearState(['courseList', 'matrixList', 'courseList']);
        this.resetFormFields([
          'courseDetail.course_nature_id',
          'courseDetail.exam_type_id',
          'courseDetail.dean_committee_id',
          'courseDetail.course_year_id',
          'courseDetail.course_id'
        ]);
      });
  }

  resetFormFields(fields: string[]) {
    fields.forEach(path => {
      const control = this.courseAttendanceReportFormGroup.get(path);
      if (control) {
        control.reset();
      }
    });
  }

  clearState(keys: (keyof typeof this.state)[]): void {
    keys.forEach(key => this.state[key] = []);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.courseAttendanceReportFormGroup = this.fb.group({
      selection: this.fb.group({
        academic_session_id: ['', Validators.required],
        semester_id: ['', Validators.required],
        degree_programme_type_id: ['', Validators.required],
        college_id: ['', Validators.required],
      }),
      courseDetail: this.fb.group({
        course_nature_id: ['', Validators.required],
        exam_type_id: ['', Validators.required],
        dean_committee_id: ['', Validators.required],
        course_year_id: ['', Validators.required],
        course_id: ['', Validators.required]
      })
    });
  }

  matrixTableOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    is_render: true,
    page: 0,
    pageSize: 10,
    title: "Report Filter"
  };

  courseListOption: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: true,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    is_render: true,
    page: 0,
    pageSize: 15,
    title: "Course List"
  };

  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession1', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("acadmcSesnList : ", result);
          this.state.acadmcSesnList = result.body.data;
        },
        (error) => {
          console.error('Error in acadmcSesnList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  getSemesterData() {
    this.http.getParam('/master/get/getSemesterList', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("semesterList : ", result.body.data);
          this.state.semesterList = result.body.data;
        },
        (error) => {
          console.error('Error in semesterList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getDegreeProgrammeTypeData() {
    this.http.getParam('/master/get/getDegreeProgramType', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("degreeProgrammeTypeList : ", result);
          this.state.degreeProgrammeTypeList = result.body.data;
        },
        (error) => {
          console.error('Error in degreeProgrammeTypeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  getCollegeData(degree_programme_type_id: number) {
    this.http.getParam('/master/get/getCollege',
      { degree_programme_type_id },
      'academic')
      .subscribe(
        (result: any) => {
          // console.log("collegeList : ", result);
          this.state.collegeList = result.body.data;
        },
        (error) => {
          console.error('Error in collegeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  getCourseData(
    academic_session_id: number,
    degree_programme_type_id: number,
    college_id: number,
    course_nature_id: number,
    exam_type_id: number,
    course_year_id: number,
    semester_id: number
  ) {
    this.http.getParam(`/course/get/getRegisteredCourseList`, {
      academic_session_id,
      degree_programme_type_id,
      college_id,
      course_nature_id,
      exam_type_id,
      course_year_id,
      semester_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          const data = result?.body?.data || [];

          if (data.length > 0) {
            // Filter distinct courses based on course_id
            const uniqueCourses = data.filter((course: any, index: number, self: any[]) =>
              index === self.findIndex((c) => c.course_id === course.course_id)
            );
            this.state.courseList = uniqueCourses;
            this.courseListOption.dataSource = uniqueCourses;
            this.courseListOption.listLength = uniqueCourses.length;
          } else {
            this.alert.alertMessage("No Course Available!", "", "error");
          }
        },
        (error) => {
          console.error('Error in courseList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getDetails_click() {
    let {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id
    } = this.courseAttendanceReportFormGroup.get('selection')?.value;
    if (college_id &&
      academic_session_id &&
      semester_id &&
      degree_programme_type_id) {
      this.getMatrixData(
        college_id,
        academic_session_id,
        semester_id,
        degree_programme_type_id
      );
    } else {
      this.alert.alertMessage("Please select all fields", "", "warning");
    }
  }

  getMatrixData(
    college_id: number,
    academic_session_id: number,
    semester_id: number,
    degree_programme_type_id: number
  ) {
    this.http.getParam('/course/get/getRunningCourseYear', {
      college_id,
      academic_session_id,
      semester_id,
      degree_programme_type_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          let data = result?.body?.data || [];

          // Sanitize data types if needed
          data.forEach((item: any) => {
            item.dean_committee_id = +item.dean_committee_id;
            item.exam_type_id = +item.exam_type_id;
          });

          // Correct multi-level sort
          let sorted = data.sort((a: any, b: any) => {
            if (a.dean_committee_id !== b.dean_committee_id) {
              return a.dean_committee_id - b.dean_committee_id;
            } else if (a.exam_type_id !== b.exam_type_id) {
              return a.exam_type_id - b.exam_type_id;
            } else if (a.course_year_id !== b.course_year_id) {
              return a.course_year_id - b.course_year_id;
            } else {
              return a.course_nature_id - b.course_nature_id;
            }
          });

          this.state.matrixList = sorted;
          this.matrixTableOptions.dataSource = this.state.matrixList;
          this.matrixTableOptions.listLength = this.state.matrixList.length
          // console.log("Sorted matrixList:===> ", this.state);
        },
        (error) => {
          console.error('Error in matrixList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );

  }

  getCourses_btn(item: any) {
    let {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id
    } = this.courseAttendanceReportFormGroup.get('selection')?.value;
    // Set course_nature_id in the form group
    this.courseAttendanceReportFormGroup.get('courseDetail.course_nature_id')?.setValue(item.course_nature_id);
    this.getCourseData(
      academic_session_id,
      degree_programme_type_id,
      college_id,
      item.course_nature_id,
      item.exam_type_id,
      item.course_year_id,
      semester_id,
    )
  }

  formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // downloadAttendanceReport(fileName: string, payload: any) {
  //   const url = this.http.baseUrl("academic") + `/file/post/studentAttendanceReportPdf`;

  //   const form = document.createElement('form');
  //   form.action = url;
  //   form.method = 'POST';
  //   form.target = '_blank';

  //   // 🔑 if you need auth headers (Bearer token, designation id),
  //   // you cannot add them here — instead, pass them via hidden inputs or query params.
  //   for (const key in payload) {
  //     if (payload.hasOwnProperty(key)) {
  //       const input = document.createElement('input');
  //       input.type = 'hidden';
  //       input.name = key;
  //       input.value = payload[key];
  //       form.appendChild(input);
  //     }
  //   }

  //   document.body.appendChild(form);
  //   form.submit();
  //   document.body.removeChild(form);
  // }


  getPdfReport_btn(course: any) {
    // console.log("course: ", course);
    let {
      college_id,
      degree_programme_type_id,
    } = this.courseAttendanceReportFormGroup.get('selection')?.value;
    let { course_nature_id } = this.courseAttendanceReportFormGroup.get('courseDetail')?.value;
    let {
      academic_session_id,
      course_id,
      course_year_id,
      // dean_committee_id
      exam_type_id,
      semester_id,
      course_name
    } = course
    const sanitizedCourseName = course_name?.replace(/\s+/g, '_');
    const fileName = `${sanitizedCourseName}_${new Date().getFullYear()}_${this.formatDate(new Date())}.pdf`;

    const getNameById = (list: any[], idKey: string, idValue: any, nameKey: string) =>
      list.find(item => item[idKey] === idValue)?.[nameKey] || '';

    const college_name_e = getNameById(this.state.collegeList, 'college_id', college_id, 'college_name_e');
    const exam_type_name_e = getNameById(this.state.matrixList, 'exam_type_id', exam_type_id, 'exam_type_name_e');
    const course_year_name_e = getNameById(this.state.matrixList, 'course_year_id', course_year_id, 'course_year_name_e');
    const semester_name_e = getNameById(this.state.semesterList, 'semester_id', semester_id, 'semester_name_e');

    this.http.postBlob(`/file/post/studentAttendanceReportPdf`, {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      course_id,
      college_id,
      exam_type_id,
      course_year_id,
      course_nature_id,
      college_name_e,
      exam_type_name_e,
      course_year_name_e,
      semester_name_e,
      orientation: this.options?.orientation || 'portrait'
    }, fileName, "academic").pipe(take(1))
      .subscribe(
        (response) => {
          // console.log("response :=> ", response.body);
          // success - process your blob here as before
          const blob = response.body;
          if (blob) {
            // const blobUrl = window.URL.createObjectURL(blob);
            // const link = document.createElement('a');
            // link.href = blobUrl;
            // link.download = fileName;
            // link.click();
            // window.URL.revokeObjectURL(blobUrl);
          } else {
            this.alert.alertMessage("No Records Found!", "Failed to download report.", "error");
            return
          }
        },
        (error) => {
          // error callback - show alert here
          console.error('Error downloading PDF:', error);
          this.alert.alertMessage("Something went wrong!", "Failed to download report. Please try again later.", "error");
        }
      );

    // this.downloadAttendanceReport(fileName, {
    //   academic_session_id,
    //   semester_id,
    //   degree_programme_type_id,
    //   course_id,
    //   college_id,
    //   exam_type_id,
    //   course_year_id,
    //   course_nature_id,
    //   college_name_e,
    //   exam_type_name_e,
    //   course_year_name_e,
    //   semester_name_e,
    //   orientation: this.options?.orientation || 'portrait'
    // });

  }

  // getPdf(): void {
  //   console.log("this.options?.orientation : ", this.options?.orientation);
  //   const html = this.print_content.nativeElement.innerHTML;
  //   this.http.postBlob(`/file/post/htmltoPdf`, {
  //     html,
  //     // orientation: this.options?.orientation || 'portrait'
  //     orientation: 'landscape'
  //   }, null).pipe(take(1)).subscribe(() => console.log("PDF Generated"));
  // }

}
