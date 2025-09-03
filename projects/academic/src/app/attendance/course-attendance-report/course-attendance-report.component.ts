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
    collegeList: [] as any[],
    degreeProgrammeList: [] as any,
    courseNatureList: [] as any,
    examTypeList: [] as any,
    deanCommitteeList: [] as any[],
    courseYearList: [] as any[],
    semesterList: [] as any[],
    courseList: [] as any[],
  };

  infoFields = [
    { label: 'College Name', valueKey: 'college_name', class: 'col-md-5 col-6' },
    { label: 'Exam Type', valueKey: 'exam_type', class: 'col-md-5 col-6' },
    { label: 'Exam Nature', valueKey: 'exam_nature', class: 'col-md-5 col-6' },
    // { label: 'Faculty', valueKey: 'faculty', class: 'col-md-5 col-5' },
    { label: 'Course Year', valueKey: 'course_year', class: 'col-md-5 col-6' },
    { label: 'Semester', valueKey: 'semester', class: 'col-md-5 col-6' },
    { label: 'Degree Programme', valueKey: 'degree_programme', class: 'col-md-5 col-6' },
    // { label: 'Exam Date', valueKey: 'exam_date', class: 'col-md-5 col-5' },
    // { label: 'OMR Course Code', valueKey: 'OMR_course_code', class: 'col-md-5 col-5' },
    { label: 'Course No./Title', valueKey: 'course_no_tile', class: 'col-md-12 col-12' },
  ];

  tableColumns = [
    { key: 'index', label: 'SNO.' },
    { key: 'ue_id', label: 'University ID' },
    { key: 'student_name', label: 'Name' },
    { key: 'stu_acad_status_id', label: 'Academic Status' },
    { key: 'course_registration_type_id', label: 'Appearing Status' },
    { key: 'student_photo_path', label: 'Photo', type: 'image' },
    { key: 'student_signature_path', label: 'Signature', type: 'image' },
    { key: 'stu_sign', label: 'Student Signature' },
    { key: 'inv_sign', label: 'Invigilator Signature' },
  ];

  studentAttendaceList = {
    page_title: "Examination Attendance Sheet",
    university: {
      name: "Indira Gandhi Krishi Vishwavidyalaya, Krishak Nagar Raipur (C.G.)",
      logo: "igkv_logo.png",
      address: ""
    },
    college: {
      college_name: "",
      exam_type: "",
      exam_nature: "",
      // faculty: "Agriculture",
      degree_programme: "",
      course_year: "",
      semester: "",
      // exam_date: "20-12-2025",
      // OMR_course_code: "",
      course_no_tile: "",
      session: ""
    },
    reports: [],
    // reports: [
    //   {
    //     ue_id: 20220721,
    //     registration_id: 254281,
    //     student_name: "ANURAG SINGH  ",
    //     stu_acad_status_id: 2,
    //     course_code: "AFOR-5111",
    //     course_id: 3163,
    //     course_title_e: "INTRODUCTION TO FORESTRY",
    //     course_type_name_e: "None",
    //     student_registration_and_marks_id: 3824741,
    //     course_registration_type_id: 2,
    //     registration_status_id: 1,
    //     is_finalize_yn: null,
    //     student_photo_path: "../_Attachment/Academic/2022-23/UG/20220721/202229567_Photo_20220814025102293_ybcejijrm5t1ik5acrb4gj3c.jpg",
    //     student_signature_path: "../_Attachment/Academic/2022-23/UG/20220721/202229567_Sign_20220814025107999_ybcejijrm5t1ik5acrb4gj3c.jpg",
    //     attendance_status_id: null
    //   },
    //   {
    //     ue_id: 20220759,
    //     student_name: "KUMESH KUMAR NETAM  ",
    //     registration_id: 254315,
    //     stu_acad_status_id: 2,
    //     course_code: "AGRO-5211",
    //     course_id: 3250,
    //     course_title_e: "CROP PRODUCTION TECHNOLOGY - I(KHARIF CROPS)",
    //     course_type_name_e: "None",
    //     student_registration_and_marks_id: 3825456,
    //     course_registration_type_id: 1,
    //     registration_status_id: 1,
    //     is_finalize_yn: null,
    //     student_photo_path: "../_Attachment/Academic/2022-23/UG/20220759/202229551_Photo_20220725103254879_bdwvfcmma2y3ewl3blzokcwv.jpg",
    //     student_signature_path: "../_Attachment/Academic/2022-23/UG/20220759/202229551_Sign_20220725103331035_bdwvfcmma2y3ewl3blzokcwv.jpg",
    //     attendance_status_id: null
    //   }
    // ]
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
      college_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      course_nature_id: ['', Validators.required],
      exam_type_id: ['', Validators.required],
      dean_committee_id: ['', Validators.required],
      course_year_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      course_id: ['', Validators.required]
    });
  }

  // academic_session_id,
  // college_id,
  // degree_programme_id,
  // course_nature_id,
  // exam_type_id,
  // dean_committee_id,
  // course_year_id,
  // semester_id,
  // course_id

  ngOnInit(): void {
    this.getAcademicSession();

    this.courseAttendanceReportFormGroup.get('academic_session_id')?.valueChanges.subscribe(academicSessionId => {
      this.state.collegeList = [];
      this.state.degreeProgrammeList = [];
      this.state.courseNatureList = [];
      this.state.examTypeList = [];
      this.state.deanCommitteeList = [];
      this.state.courseYearList = [];
      this.state.semesterList = [];
      this.state.courseList = [];
      this.courseAttendanceReportFormGroup.patchValue({
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
        this.getCollegeData();
      }
    });

    this.courseAttendanceReportFormGroup.get('college_id')?.valueChanges.subscribe(collegeId => {
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
        this.getDegreeProgrammeData(collegeId);
      }
    });

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

  getDegreeProgrammeData(college_id: number) {
    this.HTTP.getParam('/master/get/getDegreeProgramme?byColFacDegt', { college_id }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("degreeProgrammeList : ", result);
          this.state.degreeProgrammeList = result.body.data;

          // const control = this.courseAttendanceReportFormGroup.get('degree_programme_id');
          // if (this.state.degreeProgrammeList.length === 1) {
          //   const first = this.state.degreeProgrammeList[0];

          //   // ✅ Set the value automatically
          //   control?.setValue(first.degree_programme_id);

          //   // ✅ Disable the control
          //   control?.disable();
          // } else {
          //   // 🟢 Enable control and reset value if needed
          //   control?.enable();
          //   // control?.reset(); // Optional: reset if you don't want previous value
          // }
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

          // const control = this.courseAttendanceReportFormGroup.get('dean_committee_id');
          // if (this.state.deanCommitteeList.length === 1) {
          //   const first = this.state.deanCommitteeList[0];

          //   // ✅ Set the value automatically
          //   control?.setValue(first.dean_committee_id);

          //   // ✅ Disable the control
          //   control?.disable();
          // } else {
          //   // 🟢 Enable control and reset value if needed
          //   control?.enable();
          //   // control?.reset(); // Optional: reset if you don't want previous value
          // }
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
    this.HTTP.getParam(`/course/get/getCourseFromRegistration`, {
      academic_session_id,
      degree_programme_id,
      college_id,
      course_year_id,
      semester_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("courseList : ", result.body.data);
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
    course_id: number,
    dean_committee_id: number,
    college_id: number,
    degree_programme_id: number,
    course_nature_id: number,
    exam_type_id: number,
    course_year_id: number
  ) {
    this.HTTP.getParam(`/course/get/getStuWiseRegCourses`,
      {
        academic_session_id,
        semester_id,
        course_id,
        dean_committee_id,
        college_id,
        degree_programme_id,
        course_nature_id,
        exam_type_id,
        course_year_id
      }, 'academic')
      .subscribe(
        (result: any) => {
          // this.state.getStudentAttendanceList = result.body.data;
          this.studentAttendaceList.reports = result.body.data;
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
      course_id,
      dean_committee_id,
      college_id,
      degree_programme_id,
      course_nature_id,
      exam_type_id,
      course_year_id
    } = this.courseAttendanceReportFormGroup.value

    // ✅ Find the selected object from the list
    const selectedCollege = this.state.collegeList.find((college: any) => college.college_id === college_id);
    const selectedExamType = this.state.examTypeList.find((examType: any) => examType.exam_type_id === exam_type_id);
    const selectedAcademicSession = this.state.acadmcSesnList.find(academicSession => academicSession.academic_session_id === academic_session_id);
    const selectedCourseNature = this.state.courseNatureList.find((courseNature: any) => courseNature.course_nature_id === course_nature_id);
    const selectedDegreeProgramme = this.state.degreeProgrammeList.find((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);
    const selectedCourseYear = this.state.courseYearList.find((courseYear: any) => courseYear.course_year_id === course_year_id);
    const selectedSemester = this.state.semesterList.find((sem: any) => sem.semester_id === semester_id);
    const selectedCourse = this.state.courseList.find((course: any) => course.course_id === course_id);

    // ✅ Set the name into the attendance list
    if (selectedCollege
      && selectedExamType
      && selectedAcademicSession
      && selectedCourseNature
      && selectedDegreeProgramme
      && selectedCourseYear
      && selectedSemester
      && selectedCourse) {
      this.studentAttendaceList.college.college_name = selectedCollege.college_name_e;
      this.studentAttendaceList.college.session = selectedAcademicSession.academic_session_name_e;
      this.studentAttendaceList.college.exam_nature = selectedCourseNature.course_nature_name_e;
      this.studentAttendaceList.college.degree_programme = selectedDegreeProgramme.degree_programme_name_e;
      this.studentAttendaceList.college.course_year = selectedCourseYear.course_year_name_e;
      this.studentAttendaceList.college.semester = selectedSemester.semester_name_e;
      this.studentAttendaceList.college.exam_type = selectedExamType.exam_type_name_e;
      this.studentAttendaceList.college.course_no_tile = selectedCourse.course_code + "  " + selectedCourse.course_title_e;
      // this.studentAttendaceList.college.OMR_course_code = selectedCourse.course_id;
    }
    this.getStudentAttendanceList(
      academic_session_id,
      semester_id,
      course_id,
      dean_committee_id,
      college_id,
      degree_programme_id,
      course_nature_id,
      exam_type_id,
      course_year_id
    );
  };

}

