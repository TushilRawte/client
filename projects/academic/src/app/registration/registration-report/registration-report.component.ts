import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-registration-report',
  standalone: false,
  templateUrl: './registration-report.component.html',
  styleUrl: './registration-report.component.scss'
})
export class RegistrationReportComponent implements OnInit, OnDestroy {
  @Input() options: any; // PDF or Print options
  @ViewChild('print_content') print_content!: ElementRef;

  state = {
    matrixListFee: [] as any[],
    matrixListCourse: [] as any[],
    acadmcSesnList: [] as any[],
    degreeProgrammeTypeList: [] as any[],
    collegeList: [] as any[],
    degreeProgrammeList: [] as any[],
    semesterList: [] as any[],
    courseList: [] as any[],
    StudentRegsiteredList: [] as any[],
    StudentRegsiteredForCourseList: [] as any[],
  }
  registeredReportFormGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  activeReportType: string = '';

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
    private cdr: ChangeDetectorRef
  ) {
    this.registeredReportFormGroup = this.fb.group({
      selection: this.fb.group({
        academic_session_id: ['', Validators.required],
        semester_id: ['', Validators.required],
        degree_programme_type_id: ['', Validators.required],
        college_id: ['', Validators.required],
        degree_programme_id: ['', Validators.required]
      }),
      matrixDetail: this.fb.group({
        dean_committee_id: ['', Validators.required],
        course_year_id: ['', Validators.required],
        course_id: ['', Validators.required]
      })
    });
  }

  matrixFeeTableOptions: any = {
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
    pageSize: 50,
    title: "Registration Fee"
  };

  matrixCourseTableOptions: any = {
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
    pageSize: 50,
    title: "Registered Courses"
  };

  ngOnInit(): void {
    //* step: 1
    this.getAcademicSession();

    //* step: 2
    this.registeredReportFormGroup.get('selection.academic_session_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(academicSessionId => {
        this.clearState([
          'semesterList',
          'degreeProgrammeTypeList',
          'collegeList',
          'degreeProgrammeList',
          'courseList',
          'matrixListFee',
          'matrixListCourse',
          'courseList',
          'StudentRegsiteredList',
          'StudentRegsiteredForCourseList']);
        this.resetFormFields([
          'selection.semester_id',
          'selection.degree_programme_type_id',
          'selection.college_id',
          'selection.degree_programme_id',

          'matrixDetail.dean_committee_id',
          'matrixDetail.course_year_id',
          'matrixDetail.course_id'
        ]);

        if (academicSessionId) {
          this.getSemesterData();
        }
      });

    //* step: 3
    this.registeredReportFormGroup.get('selection.semester_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(semesterId => {
        this.clearState([
          'degreeProgrammeTypeList',
          'collegeList',
          'degreeProgrammeList',
          'courseList',
          'matrixListFee',
          'matrixListCourse',
          'courseList',
          'StudentRegsiteredList',
          'StudentRegsiteredForCourseList']);
        this.resetFormFields([
          'selection.degree_programme_type_id',
          'selection.college_id',
          'selection.degree_programme_id',

          'matrixDetail.dean_committee_id',
          'matrixDetail.course_year_id',
          'matrixDetail.course_id'
        ]);

        if (semesterId) {
          this.getDegreeProgrammeTypeData();
        }
      });

    //* step: 3
    this.registeredReportFormGroup.get('selection.degree_programme_type_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeTypeId => {
        this.clearState([
          'collegeList',
          'degreeProgrammeList',
          'courseList',
          'matrixListFee',
          'matrixListCourse',
          'courseList',
          'StudentRegsiteredList',
          'StudentRegsiteredForCourseList'
        ]);
        this.resetFormFields([
          'selection.college_id',
          'selection.degree_programme_id',

          'matrixDetail.dean_committee_id',
          'matrixDetail.course_year_id',
          'matrixDetail.course_id'
        ]);

        if (degreeProgrammeTypeId) {
          this.getCollegeData(degreeProgrammeTypeId);
        }
      });

    //* step: 4
    this.registeredReportFormGroup.get('selection.college_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(collegeId => {
        this.clearState([
          'degreeProgrammeList',
          'courseList',
          'matrixListFee',
          'matrixListCourse',
          'courseList',
          'StudentRegsiteredList',
          'StudentRegsiteredForCourseList']);
        this.resetFormFields([
          'selection.degree_programme_id',

          'matrixDetail.dean_committee_id',
          'matrixDetail.course_year_id',
          'matrixDetail.course_id'
        ]);
        let degreeProgrammeTypeId = this.registeredReportFormGroup.get('selection.degree_programme_type_id')?.value
        if (collegeId && degreeProgrammeTypeId) {
          this.getDegreeProgrammeData(collegeId, degreeProgrammeTypeId);
        }
      });

    //* step: 5
    this.registeredReportFormGroup.get('selection.degree_programme_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeId => {
        this.clearState([
          'courseList',
          'matrixListFee',
          'matrixListCourse',
          'courseList',
          'StudentRegsiteredList',
          'StudentRegsiteredForCourseList'
        ]);
        this.resetFormFields([
          'matrixDetail.dean_committee_id',
          'matrixDetail.course_year_id',
          'matrixDetail.course_id'
        ]);
      });
  }

  resetFormFields(fields: string[]) {
    fields.forEach(path => {
      const control = this.registeredReportFormGroup.get(path);
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

  getDetails_click(optionType: string) {
    this.activeReportType = optionType;
    let {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id
    } = this.registeredReportFormGroup.get('selection')?.value;
    if (college_id &&
      academic_session_id &&
      semester_id &&
      degree_programme_type_id) {

      if (optionType === "course") {
        // this.alert.alertMessage("Feature coming soon!", "", "info");
        // return;
        this.state.StudentRegsiteredList = [];
        this.state.matrixListFee = [];
        this.matrixFeeTableOptions.dataSource = [];
        this.matrixFeeTableOptions.listLength = 0;

        this.getMatrixDataCourse(
          college_id,
          academic_session_id,
          semester_id,
          degree_programme_type_id
        );
      } else {
        this.state.StudentRegsiteredForCourseList = [];
        this.state.matrixListCourse = [];
        this.matrixCourseTableOptions.dataSource = [];
        this.matrixCourseTableOptions.listLength = 0;

        this.getMatrixDataFee(
          college_id,
          academic_session_id,
          semester_id,
          degree_programme_type_id
        );
      }
    } else {
      this.alert.alertMessage("Please select all fields", "", "warning");
    }
  }

  getMatrixDataFee(
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
          let filteredData = data.filter((stu: any) => stu.course_nature_id === 1)

          // Sanitize data types if needed
          filteredData.forEach((item: any) => {
            item.dean_committee_id = +item.dean_committee_id;
          });

          // Correct multi-level sort
          let sorted = filteredData.sort((a: any, b: any) => {
            if (a.dean_committee_id !== b.dean_committee_id) {
              return a.dean_committee_id - b.dean_committee_id;
            } else {
              return a.course_year_id - b.course_year_id;
            }
          });

          this.state.matrixListFee = sorted;
          this.matrixFeeTableOptions.dataSource = this.state.matrixListFee;
          this.matrixFeeTableOptions.listLength = this.state.matrixListFee.length
          // console.log("Sorted matrixListFee:===> ", this.state);
        },
        (error) => {
          console.error('Error in matrixListFee:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getMatrixDataCourse(
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
          let filteredData = data.filter((stu: any) => stu.course_nature_id === 1)

          // Sanitize data types if needed
          filteredData.forEach((item: any) => {
            item.dean_committee_id = +item.dean_committee_id;
          });

          // Correct multi-level sort
          let sorted = filteredData.sort((a: any, b: any) => {
            if (a.dean_committee_id !== b.dean_committee_id) {
              return a.dean_committee_id - b.dean_committee_id;
            } else {
              return a.course_year_id - b.course_year_id;
            }
          });

          this.state.matrixListCourse = sorted;
          this.matrixCourseTableOptions.dataSource = this.state.matrixListCourse;
          this.matrixCourseTableOptions.listLength = this.state.matrixListCourse.length
          // console.log("Sorted matrixListCourse:===> ", this.state);
        },
        (error) => {
          console.error('Error in matrixListCourse:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getRegFeeReport_btn(item: any) {
    let {
      academic_session_id,
      semester_id,
      college_id,
      degree_programme_id,
    } = this.registeredReportFormGroup.get('selection')?.getRawValue();
    const course_year_id = item?.course_year_id;
    const dean_committee_id = item?.dean_committee_id;

    if (!academic_session_id || !semester_id || !college_id || !degree_programme_id || !course_year_id) {
      this.alert.alertMessage("Missing required fields", "", "warning");
      return;
    }
    this.http.getParam('/course/get/getStudentList?registeredFeeDetails=1', {
      academic_session_id,
      semester_id,
      college_id,
      course_year_id,
      degree_programme_id,
    }, 'academic')
      .subscribe(
        (result: any) => {
          let data = result?.body?.data || [];

          this.state.StudentRegsiteredList = data;
          // console.log("StudentRegsiteredList:===> ", this.state.StudentRegsiteredList);

          // Trigger change detection
          this.cdr.detectChanges();

          // Wait for DOM to update
          setTimeout(() => {
            this.getRegFeePdf(course_year_id, dean_committee_id);
          }, 0);
        },
        (error) => {
          console.error('Error in StudentRegsiteredList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getRegCourseReport_btn(item: any) {
    const course_year_id = item?.course_year_id;
    const dean_committee_id = item?.dean_committee_id;

    if (!dean_committee_id || !course_year_id) {
      this.alert.alertMessage("Missing required fields", "", "warning");
      return;
    }
    this.getRegCoursePdf(course_year_id, dean_committee_id);
  }

  //* step: 1
  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession', {}, 'academic')
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

  //* step: 2
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

  //* step: 3
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

  //* step: 4
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

  //* step: 5
  getDegreeProgrammeData(college_id: number, degree_programme_type_id: number) {
    this.http.getParam('/master/get/getDegreeProgramme', { college_id, degree_programme_type_id }, 'academic')
      .subscribe(
        (result: any) => {
          this.state.degreeProgrammeList = result.body.data || [];
          // console.log("this.state.degreeProgrammeList ===;;;>>> ", this.state.degreeProgrammeList);

          const control = this.registeredReportFormGroup.get('selection.degree_programme_id');

          if (this.state.degreeProgrammeList.length === 1) {
            const onlyItem = this.state.degreeProgrammeList[0];

            // Set the value automatically
            control?.setValue(onlyItem.degree_programme_id);

            // Disable the field
            control?.disable();
          } else {
            // Enable if more than one
            control?.enable();
          }
        },
        (error) => {
          console.error('Error in degreeProgrammeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getRegFeePdf(course_year_id: number, dean_committee_id: number): void {
    // console.log("this.options?.orientation : ", this.options?.orientation);
    // const html = this.print_content.nativeElement.innerHTML;
    const html = document.getElementById('print-section-fee')?.innerHTML;

    const getNameById = (list: any[], idKey: string, idValue: any, nameKey: string) =>
      list.find(item => item[idKey] === idValue)?.[nameKey] || '';

    let {
      academic_session_id,
      semester_id,
      college_id,
      degree_programme_id,
    } = this.registeredReportFormGroup.get('selection')?.getRawValue();


    const semester_name_e = getNameById(this.state.semesterList, 'semester_id', semester_id, 'semester_name_e');
    const college_name_e = getNameById(this.state.collegeList, 'college_id', college_id, 'college_name_e');
    const academic_session_name_e = getNameById(this.state.acadmcSesnList, 'academic_session_id', academic_session_id, 'academic_session_name_e');
    const degree_programme_name_e = getNameById(this.state.degreeProgrammeList, 'degree_programme_id', degree_programme_id, 'degree_programme_name_e');

    let course_year_name_e = this.state.matrixListFee.find(m => m.course_year_id === course_year_id)?.course_year_name_e || '';
    let dean_committee_name_e = this.state.matrixListFee.find(m => m.dean_committee_id === dean_committee_id)?.dean_committee_name_e || '';

    this.http.postBlob(`/file/post/htmltoPdf`, {
      html,
      title: `Student Regsitered Report ${academic_session_name_e}`,
      college_name_e,
      degree_programme_name_e,
      course_year_name_e,
      semester_name_e,
      dean_committee_name_e
      // orientation: 'landscape'
    }, "student_registered_report", "common").pipe(take(1)).subscribe(() => console.log("PDF Generated"));
  }

  getRegCoursePdf(course_year_id: number, dean_committee_id: number): void {
    const getNameById = (list: any[], idKey: string, idValue: any, nameKey: string) =>
      list.find(item => item[idKey] === idValue)?.[nameKey] || '';
    let {
      academic_session_id,
      semester_id,
      college_id,
      degree_programme_id,
    } = this.registeredReportFormGroup.get('selection')?.getRawValue();

    const semester_name_e = getNameById(this.state.semesterList, 'semester_id', semester_id, 'semester_name_e');
    const college_name_e = getNameById(this.state.collegeList, 'college_id', college_id, 'college_name_e');
    const academic_session_name_e = getNameById(this.state.acadmcSesnList, 'academic_session_id', academic_session_id, 'academic_session_name_e');
    const degree_programme_name_e = getNameById(this.state.degreeProgrammeList, 'degree_programme_id', degree_programme_id, 'degree_programme_name_e');

    let course_year_name_e = this.state.matrixListCourse.find(m => m.course_year_id === course_year_id)?.course_year_name_e || '';
    let dean_committee_name_e = this.state.matrixListCourse.find(m => m.dean_committee_id === dean_committee_id)?.dean_committee_name_e || '';

    this.http.postBlob(`/file/post/registeredCoursesReportPdf`, {
      title: `Student Course Registration Report ${academic_session_name_e}`,
      college_name_e,
      degree_programme_name_e,
      course_year_name_e,
      semester_name_e,
      dean_committee_name_e,
      academic_session_name_e,

      academic_session_id,
      semester_id,
      college_id,
      degree_programme_id,
      course_year_id,
      dean_committee_id
      // orientation: 'landscape'
    }, 'student_course_registration_report', "academic").pipe(take(1))
      .subscribe(
        (response) => {
          // console.log("response :=> ", response.body);
          const blob = response.body;
          if (blob) {
            // 
          } else {
            this.alert.alertMessage("No Records Found!", "Failed to download report.", "error");
            return
          }
        },
        (error) => {
          console.error('Error downloading PDF:', error);
          this.alert.alertMessage("Something went wrong!", "Failed to download report. Please try again later.", "error");
        }
      );
  }

}
