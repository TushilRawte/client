import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AlertService, HttpService } from 'shared';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-course-registration',
  standalone: false,
  templateUrl: './student-course-registration.component.html',
  styleUrl: './student-course-registration.component.scss'
})
export class StudentCourseRegistrationComponent {

@ViewChild('dropdownRef') dropdownRef!: ElementRef;


  // Master Lists
  courseYears: any[] = [];
  semesterList: any[] = [];
  academicStatusList: any[] = [];
  examTypeList: any[] = [];
  studyStatusList: any[] = [];
  regTypeList: any[] = [];
  courseNatureList: any[] = [];
  courseTypeList: any[] = [];

  // Data Lists
  courseList: any[] = [];
  filteredCourseList: any[] = [];
  registrationList: any[] = [];
  registeredCourseList: any[] = [];
  studentDetails: any = null;

  // Selection States
  selectedStudent: any = null;
  selectedRegistration: any = null;
  studentUEID: string = '';
  isSearching = false;

  // Course Dropdown States
  selectedCourse: any = null;
  courseDropdownOpen = false;
  courseSearch = '';

  // --- MODEL 1: TOP FORM (Registration / Academic Status) ---
  registrationForm = {
    course_year_id: '',
    semester_id: '',
    stu_acad_status_id: '',
    stu_study_status_id: '',
    exam_type_id: '',
    remark: '',
    current_update_YN: false, // Checkbox (true/false)
  };

  // --- MODEL 2: BOTTOM FORM (Insert Course) ---
  insertCourseForm = {
    course_id: '',
    reg_type_id: '',
    nature_id: '',
    course_type_id: '',
    course_year_id: '',
    semester_id: '',
  };

  constructor(
    private http: HttpService,
    private eRef: ElementRef,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.getCourseYears();
    this.getSemesterList();
    this.getAcademicStatus();
    this.getExamType();
    this.getStudyStatus();
    this.getCourseRegType();
    this.getCourseNature();
    this.getCourseTypeList();
  }

  // ... [Keep all your GET MASTERS functions here: getCourseYears, getSemesterList, etc.] ...
  // (omitted for brevity, assume they exist as in previous code)
  getCourseYears() {
    this.http
      .getData('/master/get/getCourseYear', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.courseYears = res.body.data;
      });
  }
  getSemesterList() {
    this.http
      .getData('/master/get/getSemesterList', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.semesterList = res.body.data;
      });
  }
  getAcademicStatus() {
    this.http
      .getData('/master/get/getAcademicStatus', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.academicStatusList = res.body.data;
      });
  }
  getExamType() {
    this.http
      .getData('/master/get/getExamType', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.examTypeList = res.body.data;
      });
  }
  getStudyStatus() {
    this.http
      .getData('/master/get/getStudentStudyStatus', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.studyStatusList = res.body.data;
      });
  }
  getCourseRegType() {
    this.http
      .getData('/master/get/getCourseRegistrationType', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.regTypeList = res.body.data;
      });
  }
  getCourseNature() {
    this.http
      .getData('/master/get/getCourseNature', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.courseNatureList = res.body.data;
      });
  }
  getCourseTypeList() {
    this.http
      .getData('/master/get/getCourseTypeList', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.courseTypeList = res.body.data;
      });
  }

  // --- STUDENT LOGIC ---

  getStudentDetails() {
    if (!this.studentUEID) return;
    this.isSearching = true;
    this.registrationList = [];
    this.registeredCourseList = [];
    this.selectedRegistration = null;
    this.selectedStudent = null; // Reset selection

    this.http
      .getData(
        `/studentProfile/get/getDegreeListForSRC?ue_id=${this.studentUEID}`,
        'academic'
      )
      .subscribe((res: any) => {
        this.isSearching = false;
        if (res?.body?.data?.length > 0) {
          this.studentDetails = res.body.data;
        } else {
          this.studentDetails = null;
          this.alert.alert(true, 'Student not found!');
        }
      });
  }

  onSelectStudent(row: any) {
    // We store the whole row because we need student_master_id (row.id) and ue_id later
    this.selectedStudent = row;
  }

  getRegistrationList(row: any) {
    this.onSelectStudent(row);

    const degree = row.degree_programme_id;
    const college = row.college_id;
    const ue = row.ue_id;

    const url = `/master/get/getListofRegByDegProg?ue_id=${ue}&degree_programme_id=${degree}&college_id=${college}`;

    this.http.getData(url, 'academic').subscribe((res: any) => {
      this.registrationList = res?.body?.data ? res.body.data : [];
      this.registeredCourseList = [];
      this.selectedRegistration = null;
    });
  }

  // --- NEW: SUBMIT REGISTRATION FORM (Top Form) ---

  submitRegistration() {
    if (!this.selectedStudent) {
      this.alert.alert(true, 'Please select a student first.');
      return;
    }
    console.log(
      'Selected Student Object:',
      JSON.stringify(this.selectedStudent, null, 2)
    );
    // Basic Validation
    if (
      !this.registrationForm.course_year_id ||
      !this.registrationForm.semester_id ||
      !this.registrationForm.stu_acad_status_id ||
      !this.registrationForm.stu_study_status_id ||
      !this.registrationForm.exam_type_id
    ) {
      this.alert.alert(true, 'Please fill all required fields (*).');
      return;
    }

    // Construct Payload matching backend "saveAcademicStatus"
    const payload = {
      //my payload
      stu_acad_status_id: this.registrationForm.stu_acad_status_id,
      admission_session: this.selectedStudent.admission_session,
      academic_session_id: this.selectedStudent.academic_session_id,
      college_id: this.selectedStudent.college_id,
      dean_committee_id: this.selectedStudent.dean_committee_id,
      degree_programme_id: this.selectedStudent.degree_programme_id,
      subject_id: this.selectedStudent.subject_id,
      course_year_id: this.registrationForm.course_year_id,
      exam_type_id: this.registrationForm.exam_type_id,
      semester_id: this.registrationForm.semester_id,
      ue_id: this.selectedStudent.ue_id,
      student_master_id: this.selectedStudent.student_id,
      admission_id: this.selectedStudent.admission_id,
      stu_study_status_id: this.registrationForm.stu_study_status_id,
      stu_violation_type_id: this.selectedStudent.stu_violation_type_id,
      stu_max_sem_done: null,
      registration_status_id: this.selectedStudent.registration_status_id,
      action_remark: this.registrationForm.remark || null,

      is_finalize_yn: 'Y',
      // Convert boolean checkbox to 'Y'/'N'
      current_update_YN: this.registrationForm.current_update_YN ? 'Y' : 'N',
    };

    console.log('Submitting Registration:', JSON.stringify(payload, null, 2));

    // Call the saveAcademicStatus API
    this.http
      .postData('/course/post/saveAcademicStatus', payload, 'academic')
      .subscribe((res: any) => {
        const body = res?.body;
        console.log('Response: ', JSON.stringify(body, null, 2));
        // -------------------------------
        // 1️⃣ Backend Exceptions
        // -------------------------------
        if (body?.error) {
          this.alert.alert(true, body.error?.message || 'Server Error!');
          return;
        }

        if (body?.status === 99) {
          // SEM RESTRICTION
          this.alert.alert(
            true,
            body.message || 'Student has completed allowed semesters!'
          );
          return;
        }

        // -------------------------------
        // 3️⃣ SUCCESS
        // -------------------------------
        this.alert.alert(
          false,
          body?.data?.message || 'Academic Status Saved Successfully'
        );

        this.getRegistrationList(this.selectedStudent);

        this.registrationForm.remark = '';
        this.registrationForm.current_update_YN = false;
      });
  }
  deleteRegistration(reg: any) {
    // 1. Validation
    if (!reg.registration_id) {
      this.alert.alert(true, 'Error: Registration ID is missing.');
      return;
    }

    // 2. Confirmation
    this.alert
      .confirmAlert(
        'Delete Registration',
        'Are you sure you want to delete this academic registration? This action is irreversible.',
        'warning'
      )
      .then((result: any) => {
        if (result.isConfirmed) {
          // 3. Prepare Payload
          // We pass registration_id as student_registration_main_id to match backend logic
          // We set delete_flag = 'Y' and active_status = 'N' to soft delete
          const payload = {
            registration_id: reg.registration_id,
          };

          // 4. API Call (Reusing the saveAcademicStatus endpoint)
          this.http
            .postData('/course/post/saveAcademicStatus', payload, 'academic')
            .subscribe((res: any) => {
              const body = res?.body;

              if (body?.error === null) {
                // Success
                this.alert.alert(
                  false,
                  body.message || 'Registration deleted successfully'
                );

                // 5. Refresh the Registration List to show changes
                if (this.selectedStudent) {
                  this.getRegistrationList(this.selectedStudent);
                }

                // Clear selection if the deleted one was selected
                if (
                  this.selectedRegistration?.registration_id ===
                  reg.registration_id
                ) {
                  this.selectedRegistration = null;
                  this.registeredCourseList = [];
                  this.resetForm();
                }
              } else {
                // Error
                this.alert.alert(
                  true,
                  body?.error?.message || 'Failed to delete registration'
                );
              }
            });
        }
      });
  }
  // --- EXISTING: INSERT COURSE LOGIC (Bottom Form) ---

  getCourseForRegistration() {
    if (!this.selectedRegistration) return;

    const courseYearId =
      this.insertCourseForm.course_year_id ||
      this.selectedRegistration.course_year_id;
    const semesterId =
      this.insertCourseForm.semester_id ||
      this.selectedRegistration.semester_id;

    if (!courseYearId || !semesterId) return;

    const params = {
      college_id: this.selectedRegistration.college_id,
      degree_programme_id: this.selectedRegistration.degree_programme_id,
      academic_session_id: this.selectedRegistration.academic_session_id,
      semester_id: semesterId,
      course_year_id: courseYearId,
    };

    this.http
      .getParam('/master/get/getCourseForRegistration', params, 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) {
          this.courseList = res.body.data;
          this.filteredCourseList = [...this.courseList];
        } else {
          this.courseList = [];
          this.filteredCourseList = [];
        }
      });
  }

  onSelectRegistration(row: any) {
    this.selectedRegistration = row;

    const params = {
      academic_session_id: row.academic_session_id,
      semester_id: row.semester_id,
      college_id: row.college_id,
      degree_programme_id: row.degree_programme_id,
      ue_id: row.ue_id,
    };

    // 1. Get the list of courses ALREADY registered
    this.getRegisteredCourses(params);

    // 2. Reset the form first
    this.resetForm();

    // 3. FIX: Pre-fill the Bottom Form with the selected row's Year and Semester
    // This ensures the dropdowns show the current context visually
    this.insertCourseForm.course_year_id = row.course_year_id;
    this.insertCourseForm.semester_id = row.semester_id;

    // 4. FIX: Trigger the API call to populate the Course Dropdown immediately
    this.getCourseForRegistration();
  }

  getRegisteredCourses(params: any) {
    this.http
      .getParam('/course/get/getRegisteredCourseList', params, 'academic')
      .subscribe((result: any) => {
        this.registeredCourseList = !result.body.error ? result.body.data : [];
        console.log(
          'Courselist: ',
          JSON.stringify(this.registeredCourseList, null, 2)
        );
      });
  }

  insertCourse() {
    if (!this.selectedRegistration) {
      this.alert.alert(true, 'Select a registration first!');
      return;
    }
    if (!this.selectedCourse) {
      this.alert.alert(true, 'Select a course!');
      return;
    }

    const payload = {
      registration_id: this.selectedRegistration.registration_id,
      course_id: this.selectedCourse?.course_id,
      course_registration_type_id: this.insertCourseForm.reg_type_id,
      course_type_id: this.insertCourseForm.course_type_id,
      course_year_id: this.insertCourseForm.course_year_id,
      semester_id: this.insertCourseForm.semester_id,
      course_nature_id: this.insertCourseForm.nature_id,
      active_status: 'Y',
      action_type: 'C',
    };

    this.http
      .postData('/course/post/saveStudentCourse', payload, 'academic')
      .subscribe((res: any) => {
        if (res?.body?.error === null) {
          this.alert.alert(false, 'Course Registration Successful');
          const params = {
            academic_session_id: this.selectedRegistration.academic_session_id,
            semester_id: this.selectedRegistration.semester_id,
            college_id: this.selectedRegistration.college_id,
            degree_programme_id: this.selectedRegistration.degree_programme_id,
            ue_id: this.selectedRegistration.ue_id,
          };
          this.getRegisteredCourses(params);
          this.resetForm();
        } else {
          this.alert.alert(true, res?.body?.error?.message || 'Error occurred');
        }
      });
  }
  // --- DELETE COURSE ---
  deleteCourse(course: any) {
    // 1. Validation: Ensure we have the ID before showing the popup
    if (!course.student_registration_and_marks_id) {
      this.alert.alert(true, 'Error: Record ID missing.');
      return;
    }

    // 2. Use your AlertService for confirmation
    this.alert
      .confirmAlert(
        'Delete Course',
        'Are you sure you want to delete this course?',
        'warning'
      )
      .then((result: any) => {
        // 3. Check if User clicked "Yes"
        if (result.isConfirmed) {
          // 4. Prepare Payload (Sending ID triggers the delete/update logic in backend)
          const payload = {
            student_registration_and_marks_id:
              course.student_registration_and_marks_id,
            registration_id: this.selectedRegistration.registration_id, // Context maintenance
          };

          // 5. Call API
          this.http
            .postData('/course/post/saveStudentCourse', payload, 'academic')
            .subscribe((res: any) => {
              if (res?.body?.error === null) {
                // Success Message
                this.alert.alert(
                  false,
                  res.body.message || 'Course Deleted Successfully'
                );

                // Refresh List
                const params = {
                  academic_session_id:
                    this.selectedRegistration.academic_session_id,
                  semester_id: this.selectedRegistration.semester_id,
                  college_id: this.selectedRegistration.college_id,
                  degree_programme_id:
                    this.selectedRegistration.degree_programme_id,
                  ue_id: this.selectedRegistration.ue_id,
                };
                this.getRegisteredCourses(params);
              } else {
                // Error Message
                this.alert.alert(
                  true,
                  res?.body?.error?.message || 'Error deleting course'
                );
              }
            });
        }
      });
  }
  // Helper functions
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      this.courseDropdownOpen = false;
    }
  }

  toggleCourseDropdown() {
    if (this.selectedRegistration) {
      this.courseDropdownOpen = !this.courseDropdownOpen;
    } else {
      this.alert.alert(true, 'Please select a registration row first.');
    }
  }

  selectCourse(c: any) {
    this.selectedCourse = c;
    this.courseDropdownOpen = false;
    this.courseSearch = '';
    this.filteredCourseList = [...this.courseList];
  }

  filterCourses() {
    const s = this.courseSearch.toLowerCase();
    this.filteredCourseList = this.courseList.filter((c) =>
      c.course_name.toLowerCase().includes(s)
    );
  }

  resetForm() {
    this.selectedCourse = null;
    this.courseSearch = '';
    this.courseList = [];
    this.filteredCourseList = [];
    this.insertCourseForm = {
      course_id: '',
      reg_type_id: '',
      nature_id: '',
      course_type_id: '',
      course_year_id: '',
      semester_id: '',
    };
  }
}

