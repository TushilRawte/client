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
    // degreeProgrammeTypeList: [] as any[],
    collegeList: [] as any[],
    // facultyList: [] as any[],
    degreeProgrammeList: [] as any,
    courseNatureList: [] as any,
    examTypeList: [] as any,
    deanCommitteeList: [] as any[],
    courseYearList: [] as any[],
    semesterList: [] as any[],
    courseList: [] as any[],
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
      // degree_programme_type_id: ['', Validators.required],
      college_id: ['', Validators.required],
      // faculty_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      // subject_id: ['', Validators.required],
      course_nature_id: ['', Validators.required],
      exam_type_id: ['', Validators.required],
      dean_committee_id: ['', Validators.required],
      course_year_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      course_id: ['', Validators.required]
    });
  }

  // academic_session_id,
  // -- degree_programme_type_id,
  // college_id,
  // -- faculty_id,
  // degree_programme_id,
  // course_nature_id,
  // exam_type_id,
  // dean_committee_id,
  // course_year_id,
  // semester_id,
  // course_id

  ngOnInit(): void {
    this.getAcademicSession();

    // Listen for cascading selections
    this.courseAttendanceReportFormGroup.get('academic_session_id')?.valueChanges.subscribe(academicSessionId => {
      // this.state.degreeProgrammeTypeList = [];
      this.state.collegeList = [];
      // this.state.facultyList = [];
      this.state.degreeProgrammeList = [];
      this.state.courseNatureList = [];
      this.state.examTypeList = [];
      this.state.deanCommitteeList = [];
      this.state.courseYearList = [];
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        // degree_programme_type_id: '',
        college_id: '',
        faculty_id: '',
        degree_programme_id: '',
        course_nature_id: '',
        exam_type_id: '',
        dean_committee_id: '',
        course_year_id: '',
        semester_id: '',
        course_id: ''
      });
      if (academicSessionId) {
        // this.getDegreeProgrammeTypeData();
        this.getCollegeData();
      }
    });

    // this.courseAttendanceReportFormGroup.get('degree_programme_type_id')?.valueChanges.subscribe(degreeProgrammeTypeId => {
    //   this.state.collegeList = [];
    //   // this.state.facultyList = [];
    //   this.state.degreeProgrammeList = [];
    //   this.state.examTypeList = [];
    //   this.state.deanCommitteeList = [];
    //   this.state.courseYearList = [];
    //   this.state.semesterList = [];
    //   this.state.courseList = [];
    //   this.courseAttendanceReportFormGroup.patchValue({
    //     college_id: '',
    //     faculty_id: '',
    //     degree_programme_id: '',
    //     course_nature_id: '',
    //     exam_type_id: '',
    //     dean_committee_id: '',
    //     course_year_id: '',
    //     semester_id: '',
    //     course_id: ''
    //   });
    //   if (degreeProgrammeTypeId) {
    //     this.getCollegeData(degreeProgrammeTypeId);
    //   }
    // });

    this.courseAttendanceReportFormGroup.get('college_id')?.valueChanges.subscribe(collegeId => {
      // this.state.facultyList = [];
      this.state.degreeProgrammeList = [];
      this.state.courseNatureList = [];
      this.state.examTypeList = [];
      this.state.deanCommitteeList = [];
      this.state.courseYearList = [];
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        faculty_id: '',
        degree_programme_id: '',
        course_nature_id: '',
        exam_type_id: '',
        dean_committee_id: '',
        course_year_id: '',
        semester_id: '',
        course_id: ''
      });
      if (collegeId) {
        // this.getFacultyData(collegeId);
        this.getDegreeProgrammeData(collegeId);
      }
    });

    // this.courseAttendanceReportFormGroup.get('faculty_id')?.valueChanges.subscribe(facultyId => {
    //   this.state.degreeProgrammeList = [];
    //   this.state.courseNatureList = [];
    //   this.state.examTypeList = [];
    //   this.state.deanCommitteeList = [];
    //   this.state.courseYearList = [];
    //   this.state.semesterList = [];
    //   this.state.courseList = [];
    //   this.courseAttendanceReportFormGroup.patchValue({
    //     degree_programme_id: '',
    //     course_nature_id: '',
    //     exam_type_id: '',
    //     dean_committee_id: '',
    //     course_year_id: '',
    //     semester_id: '',
    //     course_id: ''
    //   });
    //   if (facultyId) {
    //     this.getDegreeProgrammeData(
    //       this.courseAttendanceReportFormGroup.get('college_id')?.value,
    //       facultyId,
    //       this.courseAttendanceReportFormGroup.get('degree_programme_type_id')?.value);
    //   }
    // });

    this.courseAttendanceReportFormGroup.get('degree_programme_id')?.valueChanges.subscribe(degreeProgrammeId => {
      this.state.courseNatureList = [];
      this.state.examTypeList = [];
      this.state.deanCommitteeList = [];
      this.state.courseYearList = [];
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        course_nature_id: '',
        exam_type_id: '',
        dean_committee_id: '',
        course_year_id: '',
        semester_id: '',
        course_id: ''
      });
      if (degreeProgrammeId) {
        this.getCourseNatureData();
      }
    });

    this.courseAttendanceReportFormGroup.get('course_nature_id')?.valueChanges.subscribe(courseNatureId => {
      this.state.examTypeList = [];
      this.state.deanCommitteeList = [];
      this.state.courseYearList = [];
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        exam_type_id: '',
        dean_committee_id: '',
        course_year_id: '',
        semester_id: '',
        course_id: ''
      });
      if (courseNatureId) {
        this.getExamTypeData();
      }
    });

    this.courseAttendanceReportFormGroup.get('exam_type_id')?.valueChanges.subscribe(examTypeId => {
      this.state.deanCommitteeList = [];
      this.state.courseYearList = [];
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        dean_committee_id: '',
        course_year_id: '',
        semester_id: '',
        course_id: ''
      });
      if (examTypeId) {
        this.getDeanCommitteData(
          this.courseAttendanceReportFormGroup.get('college_id')?.value,
          this.courseAttendanceReportFormGroup.get('degree_programme_id')?.value,
          this.courseAttendanceReportFormGroup.get('academic_session_id')?.value
        );
      }
    });

    this.courseAttendanceReportFormGroup.get('dean_committee_id')?.valueChanges.subscribe(deanCommitteeId => {
      this.state.courseYearList = [];
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        course_year_id: '',
        semester_id: '',
        course_id: ''
      });
      if (deanCommitteeId) {
        this.getCourseYearData();
      }
    });

    this.courseAttendanceReportFormGroup.get('course_year_id')?.valueChanges.subscribe(courseYearId => {
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        semester_id: '',
        course_id: ''
      });
      if (courseYearId) {
        this.getSemesterData();
      }
    });

    this.courseAttendanceReportFormGroup.get('semester_id')?.valueChanges.subscribe(semesterId => {
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
        course_id: ''
      });
      if (semesterId) {
        let {
          academic_session_id,
          semester_id,
          college_id,
          degree_programme_id,
          course_year_id,
        } = this.courseAttendanceReportFormGroup.value
        this.getCourseData(
          academic_session_id,
          degree_programme_id,
          college_id,
          course_year_id,
          semester_id
        );
      }
    });
  };

  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession1', {}, 'academic')
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

  // getDegreeProgrammeTypeData() {
  //   this.HTTP.getParam('/master/get/getDegreeProgramType', {}, 'academic')
  //     .subscribe(
  //       (result: any) => {
  //         // console.log("degreeProgrammeTypeList : ", result);
  //         this.state.degreeProgrammeTypeList = result.body.data;
  //       },
  //       (error) => {
  //         console.error('Error in degreeProgrammeTypeList:', error);
  //         this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
  //       });
  // };

  // getCollegeData(degree_programme_type_id: number) {
  //   this.HTTP.getParam('/master/get/getCollege',
  //     { degree_programme_type_id: degree_programme_type_id },
  //     'academic')
  //     .subscribe(
  //       (result: any) => {
  //         // console.log("collegeList : ", result);
  //         this.state.collegeList = result.body.data;
  //       },
  //       (error) => {
  //         console.error('Error in collegeList:', error);
  //         this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
  //       });
  // };

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollege',
      {},
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

  // getFacultyData(college_id: number) {
  //   this.HTTP.getParam('/master/get/getFaculty', { college_id }, 'academic')
  //     .subscribe(
  //       (result: any) => {
  //         // console.log("faculty : ", result);
  //         this.state.facultyList = result.body.data;
  //       },
  //       (error) => {
  //         console.error('Error in getFaculty:', error);
  //         this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
  //       });
  // };

  getDegreeProgrammeData(college_id: number) {
    this.HTTP.getParam('/master/get/getDegreeProgramme?byColFacDegt', { college_id }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("degreeProgrammeList : ", result);
          this.state.degreeProgrammeList = result.body.data;
        },
        (error) => {
          console.error('Error in degreeProgrammeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getCourseNatureData() {
    this.HTTP.getParam('/master/get/getCourseNature', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("courseNatureList : ", result);
          this.state.courseNatureList = result.body.data;
        },
        (error) => {
          console.error('Error in courseNatureList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getExamTypeData() {
    this.HTTP.getParam('/master/get/getExamType', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("examTypeList : ", result);
          this.state.examTypeList = result.body.data;
        },
        (error) => {
          console.error('Error in examTypeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getDeanCommitteData(
    college_id: number,
    degree_programme_id: number,
    admission_session: number
  ) {
    this.HTTP.getParam(`/master/get/getDeanCommitee?getAttendanceReport=1`, {
      college_id,
      degree_programme_id,
      admission_session
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("deanCommitteeList : ", result);
          this.state.deanCommitteeList = result.body.data;
        },
        (error) => {
          console.error('Error in deanCommitteeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getCourseYearData() {
    this.HTTP.getParam('/master/get/getCourseYear', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("courseYearList : ", result);
          this.state.courseYearList = result.body.data;
        },
        (error) => {
          console.error('Error in courseYearList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getSemesterData() {
    this.HTTP.getParam('/master/get/getSemesterList', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("semesterList : ", result);
          this.state.semesterList = result.body.data;
        },
        (error) => {
          console.error('Error in semesterList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getCourseData(
    academic_session_id: number,
    degree_programme_id: number,
    college_id: number,
    course_year_id: number,
    semester_id: number
  ) {
    this.HTTP.getParam(`/master/get/getCourseList?getAttendanceReport=1`, {
      academic_session_id,
      degree_programme_id,
      college_id,
      course_year_id,
      semester_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("courseList : ", result);
          this.state.courseList = result.body.data;
        },
        (error) => {
          console.error('Error in courseList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  getStudentAttendanceList(
    academic_session_id: number,
    semester_id: number,
   // degree_programme_type_id: number,
    course_id: number,
    dean_committee_id: number,
    college_id: number,
   // faculty_id: number,
    degree_programme_id: number,
    course_nature_id: number,
    exam_type_id: number,
    course_year_id: number
  ) {
    this.HTTP.getParam(`/attendance/get/getStudentAttendanceList?getReport=1`,
      {
        academic_session_id,
        semester_id,
       // degree_programme_type_id,
        course_id,
        dean_committee_id,
        college_id,
       // faculty_id,
        degree_programme_id,
        course_nature_id,
        exam_type_id,
        course_year_id
      }, 'academic')
      .subscribe(
        (result: any) => {
          console.log("getStudentAttendanceList : ", result.body.data);
          // this.state.getStudentAttendanceList = result.body.data;
        },
        (error) => {
          console.error('Error in getStudentAttendanceList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  onStudentAttendanceList_click() {
    let {
      academic_session_id,
      semester_id,
    //  degree_programme_type_id,
      course_id,
      dean_committee_id,
      college_id,
   //   faculty_id,
      degree_programme_id,
      course_nature_id,
      exam_type_id,
      course_year_id,
    } = this.courseAttendanceReportFormGroup.value
    this.getStudentAttendanceList(
      academic_session_id,
      semester_id,
     // degree_programme_type_id,
      course_id,
      dean_committee_id,
      college_id,
    //  faculty_id,
      degree_programme_id,
      course_nature_id,
      exam_type_id,
      course_year_id
    );
  };

}

