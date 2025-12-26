import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-exam-time-table-report',
  standalone: false,
  templateUrl: './exam-time-table-report.component.html',
  styleUrl: './exam-time-table-report.component.scss'
})
export class ExamTimeTableReportComponent implements OnInit {

  timeTableFormGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  @ViewChild('print_content') print_content!: ElementRef;

  state: any = {
    academicSessionList: [],
    semesterList: [],
    degreeProgrammeTypeList: [],
    degreeProgrammeList: [],
    courseYearList: [],
    examTypeList: [],
    examPaperTypeList: [],
  }
  registeredCourseList: any = [];
  groupedData: any = {};
  objectKeys = Object.keys;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) { }

  ngOnInit() {
    this.initializeFilterForm();

    this.getAcademicSession();  //* Step 1
    this.getSemester();  //* Step 2
    this.getDegreeProgramTypeData();  //* Step 3
    this.getExamTypeData();  //* Step 6
    this.getExamPaperTypeData();  //* Step 7

    this.setupFormValueChanges();
  }

  initializeFilterForm() {
    this.timeTableFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      degree_programme_type_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      course_year_id: ['', Validators.required],
      exam_type_id: ['', Validators.required],
    });
  }

  private setupFormValueChanges(): void {
    this.timeTableFormGroup.get('degree_programme_type_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeTypeId => {
        this.clearState(['degreeProgrammeList', 'courseYearList']);
        this.resetFormFields([
          'degree_programme_id',
          'course_year_id'
        ]);
        if (degreeProgrammeTypeId) {
          this.getDegreeProgrammeData(degreeProgrammeTypeId);  //* Step 4
        }
      });

    this.timeTableFormGroup.get('degree_programme_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeId => {
        this.clearState(['courseYearList']);
        this.resetFormFields([
          'course_year_id',
        ]);
        if (degreeProgrammeId) {
          this.getCourseYearData();  //* Step 5
        }
      });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearState(keys: (keyof typeof this.state)[]): void {
    keys.forEach(key => this.state[key] = []);
  }

  resetFormFields(fields: string[]) {
    fields.forEach(path => {
      const control = this.timeTableFormGroup.get(path);
      if (control) {
        control.reset();
      }
    });
  }

  //* Step 1
  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession', {}, 'academic')
      .subscribe((result: any) => {
        this.state.academicSessionList = result.body.data || [];
      });
  }

  //* Step 2
  getSemester() {
    this.http.getParam('/master/get/getSemesterList/', {}, 'academic')
      .subscribe((result: any) => {
        this.state.semesterList = result.body.data || [];
      });
  }

  //* Step 3
  getDegreeProgramTypeData() {
    this.http.getParam('/master/get/getDegreeProgramType/', {}, 'academic').subscribe((result: any) => {
      this.state.degreeProgrammeTypeList = result.body.data || [];
    });
  }

  //* Step 4
  getDegreeProgrammeData(degree_programme_type_id: number) {
    this.http.getParam('/master/get/getDegreeProgramme/', { degree_programme_type_id }, 'academic')
      .subscribe((result: any) => {
        this.state.degreeProgrammeList = result.body.data || [];
      });
  }

  //* Step 5
  getCourseYearData() {
    this.http.getParam('/master/get/getCourseYear', {}, 'academic').subscribe((result: any) => {
      let { degree_programme_type_id } = this.timeTableFormGroup.value
      // ⭐ CONDITION: if type_id is 2 or 3 -> allow only year 1,2,3
      if (degree_programme_type_id == 2 ||
        degree_programme_type_id == 3) {
        this.state.courseYearList = result?.body?.data?.filter(
          (obj: any) => [1, 2, 3].includes(obj.course_year_id)
        ).map((item: any) => ({
          course_year_id: item.course_year_id,
          course_year_name_e: item.course_year_name_e
        }));
      } else {
        // otherwise show all
        this.state.courseYearList = result.body.data || [];
      }
    });
  }

  //* Step 6
  getExamTypeData() {
    this.http.getParam('/master/get/getExamType', {}, 'academic').subscribe((result: any) => {
      this.state.examTypeList = result.body.data || []
    });
  }

  //* Step 7
  getExamPaperTypeData() {
    this.http.getParam('/master/get/getExamPaperType', {}, 'academic').subscribe((result: any) => {
      this.state.examPaperTypeList = result.body.data || [];
    });
  }

  onSubmitFields() {
    let {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      degree_programme_id,
      course_year_id,
      exam_type_id } = this.timeTableFormGroup.value;
    let selectedDegreePro = this.state.degreeProgrammeList.filter((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);

    let degree_id = selectedDegreePro?.[0]?.degree_id;
    this.http.getParam('/course/get/getRegisteredCourseList', {
      examDateTime: 1,
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      degree_programme_id,
      course_year_id,
      exam_type_id,
      degree_id
    }, 'academic')
      .subscribe((result: any) => {
        if (!result.body.error) {
          let temp = result.body.data || [];
          this.registeredCourseList = temp.filter((row: any) => row.timetable_main_id !== null &&
            row.timetable_detail_id !== null);
          if (this.registeredCourseList.length === 0) {
            this.alert.alertMessage("No Record Found!", "Time Table Not Generated Until", "warning");
          } else {
            this.groupedData = this.groupRowsNested(this.registeredCourseList);
          }
        } else {
          this.alert.alertMessage("Something went wrong!", result.body.error?.message, "warning");
        }
      });
  }

  private groupRowsNested(data: any[]) {
    const result: any = {};

    data.forEach(item => {
      const courseYearId = item.course_year_id;
      const semesterId = item.semester_id;
      const degreeProgrammeId = item.degree_programme_id;
      const examTypeId = item.exam_type_id;

      if (!result[courseYearId]) {
        result[courseYearId] = {};
      }
      if (!result[courseYearId][semesterId]) {
        result[courseYearId][semesterId] = {};
      }
      if (!result[courseYearId][semesterId][degreeProgrammeId]) {
        result[courseYearId][semesterId][degreeProgrammeId] = {};
      }
      if (!result[courseYearId][semesterId][degreeProgrammeId][examTypeId]) {
        result[courseYearId][semesterId][degreeProgrammeId][examTypeId] = [];
      }
      result[courseYearId][semesterId][degreeProgrammeId][examTypeId].push(item);
    });

    return result;
  }

  // Calculate total number of rows for a course_year_id (including nested)
  getGroupRowSpan(courseYearId: string, data: any): number {
    let count = 0;
    const semesters = data[courseYearId];
    for (const semesterId in semesters) {
      count += this.getSubGroupRowSpan(courseYearId, semesterId, data);
    }
    return count;
  }

  // Calculate total rows for a semester_id group
  getSubGroupRowSpan(courseYearId: string, semesterId: string, data: any): number {
    let count = 0;
    const degrees = data[courseYearId][semesterId];
    for (const degreeProgrammeId in degrees) {
      count += this.getSubSubGroupRowSpan(courseYearId, semesterId, degreeProgrammeId, data);
    }
    return count;
  }

  // Calculate total rows for a degree_programme_id group
  getSubSubGroupRowSpan(courseYearId: string, semesterId: string, degreeProgrammeId: string, data: any): number {
    let count = 0;
    const examTypes = data[courseYearId][semesterId][degreeProgrammeId];
    for (const examTypeId in examTypes) {
      count += examTypes[examTypeId].length;
    }
    return count;
  }

  getNameFromId(id: any, fieldName: string): string {
    if (!id) return '';

    switch (fieldName) {

      case 'Course Year': {
        const item = this.state.courseYearList
          .find((y: any) => y.course_year_id == id);
        return item?.course_year_name_e || id;
      }

      case 'Semester': {
        const item = this.state.semesterList
          .find((s: any) => s.semester_id == id);
        return item?.semester_name_e || id;
      }

      case 'Degree Program': {
        const item = this.state.degreeProgrammeList
          .find((d: any) => d.degree_programme_id == id);
        return item?.degree_programme_name_e || id;
        // or use: degree_programme_full_name_e if needed
      }

      case 'Exam Type': {
        const item = this.state.examTypeList
          .find((e: any) => e.exam_type_id == id);
        return item?.exam_type_name_e || id;
      }

      default:
        return id;
    }
  }



  getPdf(): void {
    const { academic_session_id } = this.timeTableFormGroup.value;
    let selectedAcademicSession = this.state.academicSessionList
      .filter((academicSession: any) => academicSession.academic_session_id === academic_session_id);
    let session = selectedAcademicSession[0]?.academic_session_name_e;

    const html = this.print_content.nativeElement.innerHTML;
    this.http.postBlob(`/file/post/htmltoPdf`, {
      html: html,
      // orientation: this.options.orientation
      title: `Exam Time Table Report ${session}`
    }, `Exam_Time_Table_Report`, 'common').pipe(take(1)).subscribe(() => {
      // console.log("html to pdf");
    });
  }


}
