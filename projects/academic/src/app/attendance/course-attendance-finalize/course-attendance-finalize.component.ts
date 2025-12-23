import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-course-attendance-finalize',
  standalone: false,
  templateUrl: './course-attendance-finalize.component.html',
  styleUrl: './course-attendance-finalize.component.scss'
})
export class CourseAttendanceFinalizeComponent implements OnInit {
  state = {
    acadmcSesnList: [] as any[],
    semesterList: [] as any[],
    degreeProgrammeTypeList: [] as any[],
    collegeList: [] as any[],
    courseList: [] as any[],
  };

  attendanceOperation: any = {
    attendanceUpdate: false,
    finalize: false,
    unFinalize: false
  }

  finalizeCourse: any = {}
  user: any = {
    designation_arr: [327],
  };
  showEmpIdField: boolean = false;
  selectAll: boolean = true; // Default checked
  courseAttendanceList: any = [];
  courseAttendanceStudentList: any = [];
  attendanceStatusList: any = [];
  finalizeCourseFilterFormGroup!: FormGroup;
  finalizeCourseAttendanceFormGroup!: FormGroup;
  globalAttendanceStatusId: number = 1; // Default global status
  selectedCourseFilterData: any;
  selectedCourseAttedanceData: any;
  groupedStudents: any[] = [];

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) { }


  ngOnInit(): void {
    //^ Set flag to true if the user has any allowed designation
    this.showEmpIdField = this.hasAllowedDesignation([327, 342, 2423]);
    // this.sortCourseAttendanceStudentList();
    this.getAcademicSession(); // ~ load academic session
    this.finalizeCourseFilterForm(); // ? invoke form dropdown form

    this.finalizeCourseFilterFormGroup.get('academic_session_id')?.valueChanges.subscribe(academicSessionId => {
      this.state.semesterList = [];
      this.state.degreeProgrammeTypeList = [];
      this.state.collegeList = [];
      this.state.courseList = [];
      this.finalizeCourseFilterFormGroup.patchValue({
        semester_id: '',
        degree_programme_type_id: '',
        college_id: '',
        course_id: ''
      });
      if (academicSessionId) {
        this.getSemester();
      }
    });

    this.finalizeCourseFilterFormGroup.get('semester_id')?.valueChanges.subscribe(semesterId => {
      this.state.degreeProgrammeTypeList = [];
      this.state.collegeList = [];
      this.state.courseList = [];
      this.finalizeCourseFilterFormGroup.patchValue({
        degree_programme_type_id: '',
        college_id: '',
        course_id: ''
      });
      if (semesterId) {
        this.getDegreeProgrammeTypeData();
      }
    });

    this.finalizeCourseFilterFormGroup.get('degree_programme_type_id')?.valueChanges.subscribe(degreeProgrammeTypeId => {
      this.state.collegeList = [];
      this.state.courseList = [];
      this.finalizeCourseFilterFormGroup.patchValue({
        college_id: '',
        course_id: ''
      });
      if (degreeProgrammeTypeId) {
        this.getCollegeData(degreeProgrammeTypeId);
      }
    });

    this.finalizeCourseFilterFormGroup.get('college_id')?.valueChanges.subscribe(collegeId => {
      this.state.courseList = [];
      this.finalizeCourseFilterFormGroup.patchValue({
        course_id: ''
      });
      if (collegeId) {
        const { academic_session_id, semester_id, degree_programme_type_id } = this.finalizeCourseFilterFormGroup.value;
        this.getCourseData(
          academic_session_id,
          semester_id,
          degree_programme_type_id,
          collegeId
        )
      }
    });
  }

  // * ng init invoke form dropdown form
  finalizeCourseFilterForm() {
    this.finalizeCourseFilterFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      degree_programme_type_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      college_id: ['', Validators.required],
      course_id: ['', Validators.required]
    });
  }

  // * invoke form for students list
  finalizeCourseAttendanceForm() {
    this.finalizeCourseAttendanceFormGroup = this.fb.group({
      students: this.fb.array([]) // Holds each student's attendance info
    });
    // Initialize students array
    this.initializeStudentsFormArray();
    this.getAttendanceStatus();
    // ✅ Apply default status to all after form is ready
    this.onSelectAllAttendanceStatus(this.globalAttendanceStatusId);
  }

  // * Create form group
  createStudentFormGroup(student: any): FormGroup {
    let selectedDisabled = false;
    if (this.attendanceOperation.attendanceUpdate) {
      selectedDisabled = !(student.is_finalize_yn === 'N' || student.attendance_status_id !== 0) || student.is_finalize_yn === 'Y'; // (student.attendance_status_id && student.attendance_status_id !== 0)
    } else if (this.attendanceOperation.finalize) {
      selectedDisabled = !(student.is_finalize_yn === 'Y' && student.attendance_status_id);
    } else if (this.attendanceOperation.unFinalize) {
      // selectedDisabled = student.is_finalize_yn || student.is_finalize_yn === 'N';
      selectedDisabled = student.is_finalize_yn === 'Y';
    }

    return this.fb.group({
      registration_id: [student.registration_id, Validators.required],
      ue_id: [student.ue_id, Validators.required],
      degree_programme_id: [student.degree_programme_id, Validators.required],
      course_id: [this.finalizeCourse.course_id, Validators.required],
      course_nature_id: [student.course_nature_id, Validators.required],
      attendance_status_id: [
        {
          value: student.attendance_status_id || this.globalAttendanceStatusId,
          disabled: this.attendanceOperation.finalize || this.attendanceOperation.unFinalize || (student.is_finalize_yn && student.is_finalize_yn === 'Y')
        },
        Validators.required],
      selected: [{ value: false, disabled: selectedDisabled }],
      action_remark: [student.action_remark || '']
    });
  }

  // Utility method to check designation access
  hasAllowedDesignation(allowed: number[]): boolean {
    return allowed.some(id => this.user?.designation_arr?.includes(id));
  }

  get studentsFormArray(): FormArray {
    return this.finalizeCourseAttendanceFormGroup.get('students') as FormArray;
  }

  initializeStudentsFormArray() {
    this.studentsFormArray.clear();

    if (this.courseAttendanceStudentList?.length) {
      for (let student of this.courseAttendanceStudentList) {
        // console.log("dskpd-----------------------323-------------------------------");
        // console.log("student : ", student);
        this.studentsFormArray.push(this.createStudentFormGroup(student));
      }
    }
  }

  onSelectAllAttendanceStatus(selectedStatusId: number): void {
    //     attendanceOperation: any = {
    //   attendanceUpdate: false,
    //   finalize: false,
    //   unFinalize: false
    // }
    this.studentsFormArray.controls.forEach((studentGroup: AbstractControl) => {
      // console.log("studentGroup.get('attendance_status_id')", studentGroup.get('attendance_status_id')?.getRawValue());
      studentGroup.get('attendance_status_id')?.setValue(selectedStatusId);
    });
  }

  getClassForFinalizeStudents(item: any): string {
    if (this.attendanceOperation.attendanceUpdate) {
      return (item.attendance_status_id && [1, 2, 3].includes(item.attendance_status_id)
      ) && item.is_finalize_yn !== 'Y'
        ? 'background-color: #BDF9C2'
        : item?.is_finalize_yn === 'Y' ? 'background-color: #D3D3D3' : 'background-color: #fff';
    } else if (this.attendanceOperation.finalize) {
      return !(item.is_finalize_yn === 'Y' && item.attendance_status_id)
        ? 'background-color: #D3D3D3'
        : 'background-color: #fff';
    } else if (this.attendanceOperation.unFinalize) {
      return item?.is_finalize_yn === 'Y'
        ? 'background-color: #D3D3D3'
        : 'background-color: #fff';
    } else {
      return 'background-color: #fff'
    }
  }

  sortCourseAttendanceStudentList(): void {
    if (!this.courseAttendanceStudentList) return;

    // console.log("this.courseAttendanceStudentList : ", this.courseAttendanceStudentList);

    this.courseAttendanceStudentList?.sort((a: any, b: any) => {
      const aAllPending = a.student_data?.every((s: any) => !s.attendance_status_id || s.attendance_status_id === 0);
      const bAllPending = b.student_data?.every((s: any) => !s.attendance_status_id || s.attendance_status_id === 0);
      return Number(!aAllPending) - Number(!bAllPending);
    });
  }

  sortCourseAttendanceList(): void {
    // console.log("this.courseAttendanceList : ", this.courseAttendanceList);
    this.courseAttendanceList.sort((a: any, b: any) => {
      const aAllFinalized = a.student_count === a.finalize;
      const bAllFinalized = b.student_count === b.finalize;
      return (aAllFinalized === bAllFinalized) ? 0 : aAllFinalized ? 1 : -1;
    });
  }

  onToggleSelectAll(isChecked: boolean): void {
    this.studentsFormArray.controls.forEach((studentGroup: AbstractControl) => {
      const registrationId = studentGroup.get('registration_id')?.value;
      const courseNatureId = studentGroup.get('course_nature_id')?.value;

      const matchedStudent = this.courseAttendanceStudentList
        .find((student: any) =>
          student.registration_id === registrationId &&
          student.course_nature_id === courseNatureId
        );
      let shouldSelect;
      //  = matchedStudent && (!matchedStudent.attendance_status_id || matchedStudent.attendance_status_id === 0);
      if (this.attendanceOperation.attendanceUpdate) {
        shouldSelect = matchedStudent && (!matchedStudent.attendance_status_id || matchedStudent.attendance_status_id === 0);
      } else if (this.attendanceOperation.finalize) {
        shouldSelect = matchedStudent && (!matchedStudent.is_finalize_yn || matchedStudent.is_finalize_yn === 'Y');
      } else if (this.attendanceOperation.unFinalize) {
        shouldSelect = matchedStudent && (!matchedStudent.is_finalize_yn || matchedStudent.is_finalize_yn === 'N');
      }
      studentGroup.get('selected')?.setValue(isChecked && shouldSelect);
    });
  }

  getGroupedStudentsByRegistration(studentData: any[]): any[] {
    if (!Array.isArray(studentData)) return [];

    const grouped: { [regId: string]: any[] } = {};

    studentData.forEach((record) => {
      if (!grouped[record.registration_id]) {
        grouped[record.registration_id] = [];
      }

      // Find form index from FormArray
      const formIndex = this.studentsFormArray.controls.findIndex(ctrl =>
        ctrl.get('registration_id')?.value === record.registration_id &&
        ctrl.get('degree_programme_id')?.value === record.degree_programme_id &&
        ctrl.get('course_nature_id')?.value === record.course_nature_id
      );

      grouped[record.registration_id].push({
        ...record,
        formIndex
      });
    });

    return Object.entries(grouped).map(([registration_id, records]) => ({
      registration_id,
      student_name: records[0]?.student_name || '',
      records
    }));
  }

  prepareGroupedStudents(): void {
    const groupedMap = new Map<string, any>();

    // console.log("this.courseAttendanceStudentList:", this.courseAttendanceStudentList);
    const isAttendanceUpdate = this.attendanceOperation?.attendanceUpdate;
    const isFinalizeOrUnfinalize = this.attendanceOperation?.finalize || this.attendanceOperation?.unFinalize;

    if (!this.courseAttendanceStudentList || (!isAttendanceUpdate && !isFinalizeOrUnfinalize)) return;

    this.courseAttendanceStudentList.forEach((student: any, index: number) => {
      // Determine group_type and key based on operation
      // const group_type = isAttendanceUpdate
      //   ? (student.attendance_status_id === 0 || student.attendance_status_id == null ? 'unfinalized' : 'finalized')
      //   : (student.is_finalize_yn === 'N' || student.is_finalize_yn == null ? 'unfinalized' : 'finalized');
      const checkCondition =
        [1, 2, 3].includes(student.attendance_status_id) &&
        student.is_finalize_yn === 'Y';
      const group_type = checkCondition ? 'finalized' : 'unfinalized'

      const key = `${group_type}-${student.degree_programme_name_e}`;

      // Initialize group if not already
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          degree_programme_name_e: student.degree_programme_name_e,
          group_type,
          records: [],
        });
      }

      // Push student with formIndex
      groupedMap.get(key).records.push({
        ...student,
        formIndex: index,
      });
    });

    // Convert map to sorted array: unfinalized first
    const groupedArray = Array.from(groupedMap.values());
    this.groupedStudents = [
      // ...groupedArray.filter(g => g.group_type === 'unfinalized'),
      ...groupedArray.filter(g => g.group_type === 'finalized'),
    ];

    // console.log("groupedStudents : ", this.groupedStudents);
  }

  // ~ ng init load academic session
  getAcademicSession() {
    this.HTTP.getParam(
      '/master/get/getAcademicSession/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log('session', result);
      this.state.acadmcSesnList = result.body.data;
    });
  }

  // ~ ng init load degree programm type
  getDegreeProgrammeTypeData() {
    this.HTTP.getParam(
      '/master/get/getDegreeProgramType/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log(result);
      this.state.degreeProgrammeTypeList = result.body.data;
    });
  }

  // ~ ng init load semester
  getSemester() {
    this.HTTP.getParam(
      '/master/get/getSemesterList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log(result);
      this.state.semesterList = result.body.data;
    });
  }

  // ~ load college
  getCollegeData(degree_programme_type_id: number) {
    this.HTTP.getParam('/master/get/getCollege',
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

  // ~ load college
  getCourseData(
    academic_session_id: number,
    semester_id: number,
    degree_programme_type_id: number,
    college_id: number
  ) {
    this.HTTP.getParam(`/course/get/getRegisteredCourseList`, {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id
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

  // step 1: button click 
  getCourseAttendanceList_Btn_click() {
    if (this.finalizeCourseFilterFormGroup.invalid) {
      this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id,
      course_id
    } = this.finalizeCourseFilterFormGroup.value;

    this.finalizeCourse = {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id,
      course_id
    };

    // ✅ Now call the API or function to fetch course attendance
    this.getCourseWiseAttendance(
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id,
      course_id,
      1
    );
  }

  // step 2: get status list by employee
  getCourseWiseAttendance(
    academic_session_id: number,
    semester_id: number,
    degree_programme_type_id: number,
    college_id: number,
    course_id: number,
    exam_type_id: number,
  ) {
    let params = {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id,
      course_id,
      exam_type_id,
    }
    // academic_session_id,semester_id,academic_session_id,semester_id,degree_programme_type_id,emp_id
    // console.log("params getCourseWiseAttendance : ", params);
    this.HTTP.getParam(
      '/attendance/get/getCourseWiseAttendance',
      params,
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        // console.log("getCourseWiseAttendance data :", res.body.data);
        this.courseAttendanceList = res.body.data;
        this.sortCourseAttendanceList(); //! off when data come to API
        this.courseAttendanceStudentList = []; //^ Clear previous student list
      } else {
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    },
      (error) => {
        console.error('Error in getCourseWiseAttendance:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      }
    );
  }

  // step 3: get stust list by employee
  onStatusClick(item: any, operation: string): void {
    // console.log("item : ", item);
    // console.log("this.finalizeCourse : ", this.finalizeCourse);

    this.attendanceOperation = {
      attendanceUpdate: operation === "attendanceUpdate",
      finalize: operation === "finalize",
      unFinalize: operation === "unFinalize"
    };
    // console.log("item : ", item, "operation : ", operation);
    this.finalizeCourse = { ...this.finalizeCourse, ...item };
    // console.log("onStatusClick finalizeCourse: ", this.finalizeCourse);
    this.getStudentAttendanceList(
      this.finalizeCourse.academic_session_id,
      this.finalizeCourse.degree_programme_type_id,
      this.finalizeCourse.semester_id,
      // item.course_id,
      this.finalizeCourse.course_id,
      1, // course_registration_type_id (you can make this configurable)
      this.finalizeCourse.dean_committee_id,
      this.finalizeCourse.college_id
    );
  }

  // step 4: call getStudentAttendanceList()
  getStudentAttendanceList(
    academic_session_id: number,
    degree_programme_type_id: number,
    semester_id: number,
    course_id: number,
    course_registration_type_id: number,
    dean_committee_id: number,
    college_id: number) {
    let params = {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      course_id,
      course_registration_type_id,
      dean_committee_id,
      college_id
    }
    this.HTTP.getParam(
      '/course/get/getStuWiseRegCourses',
      params,
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        // console.log("getStudentAttendanceList", res.body.data);
        this.courseAttendanceStudentList = res.body.data;
        // this.attendanceTableOptions.dataSource = [...this.courseAttendanceStudentList]; // * for printing option
        this.finalizeCourseAttendanceForm();

        this.sortCourseAttendanceStudentList();
        this.initializeStudentsFormArray();
        this.prepareGroupedStudents();

        // ✅ Auto-select unfinalized students
        this.onToggleSelectAll(true);
      } else {
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    },
      (error) => {
        console.error('Error in getStudentAttendanceList:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      }
    );
  }

  // ~ load attendance stutus after getCourseAttendanceList_Btn_click
  getAttendanceStatus() {
    this.HTTP.getParam(
      '/master/get/getAttendanceStatus/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log(result);
      this.attendanceStatusList = result.body.data;
    });
  }

  // ^ final update students data
  onUpdate(): void {
    const formValue = this.finalizeCourseAttendanceFormGroup.value;

    // console.log('✅ Selected Students:', selectedStudents);
    const selectedStudents = formValue.students
      .filter((student: any) => student.selected)
      .map((student: any) => ({
        registration_id: student.registration_id,
        course_id: this.finalizeCourse.course_id,
        course_nature_id: student.course_nature_id,
        attendance_status_id: student.attendance_status_id
      }));

    if (selectedStudents.length === 0) {
      this.alert.alertMessage("Please select at least one student", "", "warning");
      return;
    }
    // console.log('Selected Students in update:', selectedStudents);
    this.HTTP.putData('/attendance/update/updateStudentCourseAttendance/', selectedStudents, 'academic').subscribe(
      (res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Student course attendance updated!", "", "success");
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      },
      (error) => {
        console.error('Error in courseAttendance:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      }
    );
  }

  // ^ on finalize students
  onFinalize(): void {
    const formValue = this.finalizeCourseAttendanceFormGroup.value;

    // console.log('✅ Selected Students:', formValue.students);
    const selectedStudents = formValue.students
      .filter((student: any) => student.selected)
      .map((student: any) => ({
        registration_id: student.registration_id,
        ue_id: student.ue_id,
        course_id: this.finalizeCourse.course_id,
        course_nature_id: student.course_nature_id,
        is_finalize_yn: student?.selected ? 'Y' : 'N'
      }));

    if (selectedStudents.length === 0) {
      this.alert.alertMessage("Please select at least one student", "", "warning");
      return;
    }
    // console.log('Selected Students in finalize:', selectedStudents);
    this.HTTP.putData('/attendance/update/updateStudentCourseAttendance/', selectedStudents, 'academic').subscribe(
      (res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Student course attendance updated!", "", "success");
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      },
      (error) => {
        console.error('Error in courseAttendance:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      }
    );
  }

  // ^ on un-finalize students
  onUnfinalize(): void {
    const formValue = this.finalizeCourseAttendanceFormGroup.value;

    // console.log('✅ Selected Students:', formValue.students);
    const selectedStudents = formValue.students
      .filter((student: any) => student.selected)
      .map((student: any) => ({
        registration_id: student.registration_id,
        ue_id: student.ue_id,
        course_id: this.finalizeCourse.course_id,
        course_nature_id: student.course_nature_id,
        is_finalize_yn: 'N',
        action_remark: student?.action_remark || ''
      }));

    if (selectedStudents.length === 0) {
      this.alert.alertMessage("Please select at least one student", "", "warning");
      return;
    }
    console.log('Selected Students in un-finalize:', selectedStudents);

    this.HTTP.putData('/attendance/update/unFinalizeStudentCourseAttendance/',
      selectedStudents,
      'academic').subscribe(
        (res: any) => {
          if (!res.body.error) {
            // console.log("res : ", res);
            this.alert.alertMessage(res.body?.data?.message || "Student course attendance updated!", "", "success");
          } else {
            this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
          }
        },
        (error) => {
          console.error('Error in courseAttendance un-finalize:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  handleAttendanceAction(): void {
    if (this.attendanceOperation?.attendanceUpdate) {
      this.onUpdate();
    } else if (this.attendanceOperation?.finalize) {
      this.onUnfinalize();
    } else if (this.attendanceOperation?.unFinalize) {
      this.onFinalize();
    }
  }


}
