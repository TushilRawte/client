import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-course-attendance-report',
  standalone: false,
  templateUrl: './course-attendance-report.component.html',
  styleUrl: './course-attendance-report.component.scss'
})
export class CourseAttendanceReportComponent implements OnInit {
  state = {
    acadmcSesnList: [] as any[],
    degreeProgrammeTypeList: [] as any[],
    collegeList: [] as any[],
    facultyList: [] as any[],
    degreeProgrammeList: [] as any,
    semesterList: [] as any[],
  };

  courseAttendanceReportFormGroup!: FormGroup;
  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.courseAttendanceReportFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      degree_programme_type_id: ['', Validators.required],
      college_id: ['', Validators.required],
      faculty_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      subject_id: ['', Validators.required],
      course_nature_id: ['', Validators.required],
      exam_type_id: ['', Validators.required],
      dean_committee_id: ['', Validators.required],
      course_year_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      course_id: ['', Validators.required]
    });
  }

  //   academic_session_id,
  //   degree_programme_type_id,
  //   college_id,
  //   faculty_id,
  //   degree_programme_id,
  //   subject_id,
  //   course_nature_id,
  //   exam_type_id,
  //   dean_committee_id,
  //   course_year_id,
  //   semester_id,

  ngOnInit(): void {
    this.getAcademicSession();
    this.getDegreeProgrammeTypeData();

    // Listen for cascading selections
    this.courseAttendanceReportFormGroup.get('degree_programme_type_id')?.valueChanges.subscribe(degreeProgrammeTypeId => {
      this.state.collegeList = [];
      this.state.facultyList = [];
      this.state.semesterList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        college_id: '',
        faculty_id: '',
        semester_id: ''
      });
      if (degreeProgrammeTypeId) {
        this.getCollegeData(degreeProgrammeTypeId);
      }
    });

    this.courseAttendanceReportFormGroup.get('college_id')?.valueChanges.subscribe(collegeId => {
      this.state.facultyList = [];
      this.state.semesterList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        faculty_id: '',
        semester_id: ''
      });
      if (collegeId) {
        this.getFacultyData(collegeId);
      }
    });

    this.courseAttendanceReportFormGroup.get('faculty_id')?.valueChanges.subscribe(facultyId => {
      this.state.semesterList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        degree_programme_id: '',
        semester_id: ''
      });
      if (facultyId) {
        this.getSemester(facultyId);
      }
    });
  };

  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession1/', {}, 'academic')
      .subscribe((result: any) => {
        this.state.acadmcSesnList = result.body.data;
      });
  };

  getDegreeProgrammeTypeData() {
    this.HTTP.getParam('/master/get/getDegreeProgramType/', {}, 'academic')
      .subscribe((result: any) => {
        this.state.degreeProgrammeTypeList = result.body.data;
      });
  };

  getCollegeData(degree_programme_type_id: number) {
    this.HTTP.getParam('/master/get/getCollege',
      { degree_programme_type_id: degree_programme_type_id },
      'academic')
      .subscribe((result: any) => {
        this.state.collegeList = result.body.data;
      });
  };

  getFacultyData(college_id: number) {
    this.HTTP.getParam('/master/get/getFaculty', { college_id }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("faculty : ", result);
          this.state.facultyList = result.body.data; // ✅ Corrected this line
        },
        (error) => {
          console.error('Error in getFaculty:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getSemester(faculty_id: number) {
    this.HTTP.getParam('/master/get/getSemesterList/', { faculty_id }, 'academic')
      .subscribe((result: any) => {
        this.state.semesterList = result.body.data;
      });
  };

  getStudentList_Btn_click() {
    // Call your final function to get student list here
  };
}

