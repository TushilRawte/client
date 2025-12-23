import { Component, OnInit, ɵɵstoreLet } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-attendance-unfinalize',
  standalone: false,
  templateUrl: './attendance-unfinalize.component.html',
  styleUrl: './attendance-unfinalize.component.scss'
})
export class AttendanceUnfinalizeComponent implements OnInit {
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
  selectAll: boolean = false; // Start unchecked
  courseAttendanceList: any = [];
  courseAttendanceStudentList: any = [];
  attendanceStatusList: any = [];
  finalizeCourseFilterFormGroup!: FormGroup;
  finalizeCourseAttendanceFormGroup!: FormGroup;
  globalAttendanceStatusId: number = 1; // Default global status
  groupedStudents: any[] = [];

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) { }

  ngOnInit(): void {
    this.showEmpIdField = this.hasAllowedDesignation([327, 342, 2423]);
    this.getAcademicSession();
    this.initializeFilterForm();
    this.setupFormValueChanges();
  }

  initializeFilterForm() {
    this.finalizeCourseFilterFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      degree_programme_type_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      college_id: ['', Validators.required],
      course_id: ['', Validators.required]
    });
  }

  setupFormValueChanges() {
    this.finalizeCourseFilterFormGroup.get('academic_session_id')?.valueChanges.subscribe(academicSessionId => {
      this.clearDependentFields(['semester_id', 'degree_programme_type_id', 'college_id', 'course_id']);
      if (academicSessionId) {
        this.getSemester();
      }
    });

    this.finalizeCourseFilterFormGroup.get('semester_id')?.valueChanges.subscribe(semesterId => {
      this.clearDependentFields(['degree_programme_type_id', 'college_id', 'course_id']);
      if (semesterId) {
        this.getDegreeProgrammeTypeData();
      }
    });

    this.finalizeCourseFilterFormGroup.get('degree_programme_type_id')?.valueChanges.subscribe(degreeProgrammeTypeId => {
      this.clearDependentFields(['college_id', 'course_id']);
      if (degreeProgrammeTypeId) {
        this.getCollegeData(degreeProgrammeTypeId);
      }
    });

    this.finalizeCourseFilterFormGroup.get('college_id')?.valueChanges.subscribe(collegeId => {
      this.clearDependentFields(['course_id']);
      if (collegeId) {
        const { academic_session_id, semester_id, degree_programme_type_id } = this.finalizeCourseFilterFormGroup.value;
        this.getCourseData(academic_session_id, semester_id, degree_programme_type_id, collegeId);
      }
    });
  }

  clearDependentFields(fields: string[]) {
    fields.forEach(field => {
      (this.state as any)[field.replace('_id', 'List')] = [];
      this.finalizeCourseFilterFormGroup.patchValue({ [field]: '' });
    });
  }

  initializeStudentForm() {
    this.finalizeCourseAttendanceFormGroup = this.fb.group({
      students: this.fb.array([])
    });
    this.getAttendanceStatus();
    this.initializeStudentsFormArray();
  }

  createStudentFormGroup(student: any): FormGroup {
    // Determine if student should be selectable based on operation
    let selectedDisabled = false;

    if (this.attendanceOperation.attendanceUpdate) {
      // For update: only allow if not finalized
      selectedDisabled = student.attendance_finalize_yn === 'Y';
    } else if (this.attendanceOperation.finalize) {
      // For finalize: only allow if not already finalized
      selectedDisabled = student.attendance_finalize_yn === 'Y';
    } else if (this.attendanceOperation.unFinalize) {
      // For unfinalize: only allow if already finalized
      selectedDisabled = student.attendance_finalize_yn === 'N';
    }

    // Determine if attendance status should be editable
    const attendanceStatusDisabled =
      this.attendanceOperation.finalize ||
      this.attendanceOperation.unFinalize ||
      student.attendance_finalize_yn === 'Y';

    return this.fb.group({
      registration_id: [student.registration_id, Validators.required],
      ue_id: [student.ue_id, Validators.required],
      degree_programme_id: [student.degree_programme_id, Validators.required],
      course_id: [this.finalizeCourse.course_id, Validators.required],
      course_nature_id: [student.course_nature_id, Validators.required],
      attendance_status_id: [{
        value: student.attendance_status_id || this.globalAttendanceStatusId,
        disabled: attendanceStatusDisabled
      }, Validators.required],
      selected: [{ value: false, disabled: selectedDisabled }],
      action_remark: [student.action_remark || '']
    });
  }

  get studentsFormArray(): FormArray {
    return this.finalizeCourseAttendanceFormGroup?.get('students') as FormArray;
  }

  initializeStudentsFormArray() {
    if (!this.finalizeCourseAttendanceFormGroup) return;

    const studentsArray = this.studentsFormArray;
    studentsArray.clear();

    this.courseAttendanceStudentList?.forEach((student: any) => {
      studentsArray.push(this.createStudentFormGroup(student));
    });

    // Apply global status after initialization
    this.onSelectAllAttendanceStatus(this.globalAttendanceStatusId);
  }

  onSelectAllAttendanceStatus(selectedStatusId: number): void {
    if (!this.studentsFormArray) return;

    this.studentsFormArray.controls.forEach((studentGroup: AbstractControl) => {
      if (!studentGroup.get('attendance_status_id')?.disabled) {
        studentGroup.get('attendance_status_id')?.setValue(selectedStatusId);
      }
    });
  }

  getClassForFinalizeStudents(item: any): string {
    if (this.attendanceOperation.attendanceUpdate) {
      if (item.attendance_finalize_yn === 'Y') {
        return 'background-color: #D3D3D3';
      } else if (item.attendance_status_id && [1, 2, 3].includes(item.attendance_status_id)) {
        return 'background-color: #BDF9C2';
      }
    } else if (this.attendanceOperation.finalize) {
      if (item.attendance_finalize_yn === 'Y') {
        return 'background-color: #D3D3D3';
      }
    } else if (this.attendanceOperation.unFinalize) {
      if (item.attendance_finalize_yn === 'N') {
        return 'background-color: #D3D3D3';
      }
    }
    return 'background-color: #fff';
  }

  onToggleSelectAll(isChecked: boolean): void {
    this.selectAll = isChecked;

    this.studentsFormArray?.controls.forEach((studentGroup: AbstractControl) => {
      // Only enable/disable if not already disabled
      if (!studentGroup.get('selected')?.disabled) {
        studentGroup.get('selected')?.setValue(isChecked);
      }
    });
  }

  prepareGroupedStudents(): void {
    if (!this.courseAttendanceStudentList || this.courseAttendanceStudentList.length === 0) {
      this.groupedStudents = [];
      return;
    }

    const groupedMap = new Map<string, any>();

    this.courseAttendanceStudentList.forEach((student: any, index: number) => {
      const key = student.degree_programme_name_e;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          degree_programme_name_e: student.degree_programme_name_e,
          records: [],
        });
      }

      groupedMap.get(key).records.push({
        ...student,
        formIndex: index,
      });
    });

    this.groupedStudents = Array.from(groupedMap.values());
  }

  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession1/', {}, 'academic')
      .subscribe((result: any) => {
        this.state.acadmcSesnList = result.body.data || [];
      });
  }

  getDegreeProgrammeTypeData() {
    this.HTTP.getParam('/master/get/getDegreeProgramType/', {}, 'academic')
      .subscribe((result: any) => {
        this.state.degreeProgrammeTypeList = result.body.data || [];
      });
  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/', {}, 'academic')
      .subscribe((result: any) => {
        this.state.semesterList = result.body.data || [];
      });
  }

  getCollegeData(degree_programme_type_id: number) {
    this.HTTP.getParam('/master/get/getCollege', { degree_programme_type_id }, 'academic')
      .subscribe((result: any) => {
        this.state.collegeList = result.body.data || [];
      }, (error) => {
        console.error('Error in collegeList:', error);
        this.alert.alertMessage("Error", "Failed to load colleges", "error");
      });
  }

  getCourseData(academic_session_id: number, semester_id: number,
    degree_programme_type_id: number, college_id: number) {
    this.HTTP.getParam('/course/get/getRegisteredCourseList', {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id,
      courseAttendaceReport: 1
    }, 'academic')
      .subscribe((result: any) => {
        this.state.courseList = result.body.data || [];
      }, (error) => {
        console.error('Error in courseList:', error);
        this.alert.alertMessage("Error", "Failed to load courses", "error");
      });
  }

  getCourseAttendanceList_Btn_click() {
    if (this.finalizeCourseFilterFormGroup.invalid) {
      this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }

    const formValue = this.finalizeCourseFilterFormGroup.value;
    this.finalizeCourse = { ...formValue };

    this.getCourseWiseAttendance(
      formValue.academic_session_id,
      formValue.semester_id,
      formValue.degree_programme_type_id,
      formValue.college_id,
      formValue.course_id,
      1 // exam_type_id
    );
  }

  getCourseWiseAttendance(academic_session_id: number, semester_id: number,
    degree_programme_type_id: number, college_id: number,
    course_id: number, exam_type_id: number) {
    const params = {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      college_id,
      course_id,
      exam_type_id,
    };

    this.HTTP.getParam('/attendance/get/getCourseWiseAttendance', params, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          this.courseAttendanceList = res.body.data || [];
          this.courseAttendanceStudentList = [];
          this.groupedStudents = [];
        } else {
          this.alert.alertMessage("Error", res.body.error?.message || "Failed to load course attendance", "warning");
        }
      }, (error) => {
        console.error('Error in getCourseWiseAttendance:', error);
        this.alert.alertMessage("Error", "Network error occurred", "error");
      });
  }

  onStatusClick(item: any, operation: string): void {
    // Reset operation states
    this.attendanceOperation = {
      attendanceUpdate: operation === "attendanceUpdate",
      finalize: operation === "finalize",
      unFinalize: operation === "unFinalize"
    };

    // Update course info with selected item
    this.finalizeCourse = {
      ...this.finalizeCourse,
      ...item
    };

    this.getStudentAttendanceList(
      this.finalizeCourse.academic_session_id,
      this.finalizeCourse.degree_programme_type_id,
      this.finalizeCourse.semester_id,
      this.finalizeCourse.course_id,
      1, // course_registration_type_id
      this.finalizeCourse.dean_committee_id,
      this.finalizeCourse.college_id
    );
  }

  getStudentAttendanceList(academic_session_id: number, degree_programme_type_id: number,
    semester_id: number, course_id: number,
    course_registration_type_id: number, dean_committee_id: number,
    college_id: number) {
    let params: any = {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      course_id,
      course_registration_type_id,
      dean_committee_id,
      college_id
    };

    // Add attendance_finalize_yn filter based on operation
    if (this.attendanceOperation.finalize) {
      // For finalize: get students that are NOT finalized
      params.attendance_finalize_yn = 'N';
    } else if (this.attendanceOperation.unFinalize) {
      // For unfinalize: get students that ARE finalized
      params.attendance_finalize_yn = 'Y';
    }
    // For attendanceUpdate: get all students (no filter)

    this.HTTP.getParam('/course/get/getStuWiseRegCourses', params, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          this.courseAttendanceStudentList = res.body.data || [];
          this.initializeStudentForm();
          this.prepareGroupedStudents();

          // Auto-select all by default
          this.onToggleSelectAll(true);
        } else {
          this.alert.alertMessage("Error", res.body.error?.message || "Failed to load student list", "warning");
        }
      }, (error) => {
        console.error('Error in getStudentAttendanceList:', error);
        this.alert.alertMessage("Error", "Network error occurred", "error");
      });
  }

  getAttendanceStatus() {
    this.HTTP.getParam('/master/get/getAttendanceStatus/', {}, 'academic')
      .subscribe((result: any) => {
        this.attendanceStatusList = result.body.data || [];
      });
  }

  handleAttendanceAction(): void {
    if (!this.studentsFormArray) return;

    const formValue = this.finalizeCourseAttendanceFormGroup.value;
    const selectedStudents = formValue.students
      .filter((student: any) => student.selected)
      .map((student: any) => ({
        registration_id: student.registration_id,
        ue_id: student.ue_id,
        course_id: this.finalizeCourse.course_id,
        course_nature_id: student.course_nature_id,
        attendance_status_id: student.attendance_status_id,
        attendance_finalize_yn: this.getFinalizeStatus(),
        action_remark: student.action_remark || ''
      }));

    if (selectedStudents.length === 0) {
      this.alert.alertMessage("No Selection", "Please select at least one student", "warning");
      return;
    }

    if (this.attendanceOperation.attendanceUpdate) {
      this.updateAttendance(selectedStudents);
    } else if (this.attendanceOperation.finalize) {
      this.finalizeAttendance(selectedStudents);
    } else if (this.attendanceOperation.unFinalize) {
      this.unfinalizeAttendance(selectedStudents);
    }
  }

  getFinalizeStatus(): string {
    if (this.attendanceOperation.finalize) return 'Y';
    if (this.attendanceOperation.unFinalize) return 'N';
    return ''; // For update, maintain current status
  }

  updateAttendance(students: any[]) {
    this.HTTP.putData('/attendance/update/updateStudentCourseAttendance/', students, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Success", "Attendance updated successfully!", "success");
          this.refreshData();
        } else {
          this.alert.alertMessage("Error", res.body.error?.message || "Update failed", "warning");
        }
      }, (error) => {
        console.error('Error updating attendance:', error);
        this.alert.alertMessage("Error", "Network error occurred", "error");
      });
  }

  finalizeAttendance(students: any[]) {
    this.HTTP.putData('/attendance/update/finalizeStudentCourseAttendance/', students, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Success", "Attendance finalized successfully!", "success");
          this.refreshData();
        } else {
          this.alert.alertMessage("Error", res.body.error?.message || "Finalization failed", "warning");
        }
      }, (error) => {
        console.error('Error finalizing attendance:', error);
        this.alert.alertMessage("Error", "Network error occurred", "error");
      });
  }

  unfinalizeAttendance(students: any[]) {
    this.HTTP.putData('/attendance/update/unFinalizeStudentCourseAttendance/', students, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Success", "Attendance unfinalized successfully!", "success");
          this.refreshData();
        } else {
          this.alert.alertMessage("Error", res.body.error?.message || "Unfinalization failed", "warning");
        }
      }, (error) => {
        console.error('Error unfinalizing attendance:', error);
        this.alert.alertMessage("Error", "Network error occurred", "error");
      });
  }

  refreshData() {
    // Refresh student list after action
    this.getStudentAttendanceList(
      this.finalizeCourse.academic_session_id,
      this.finalizeCourse.degree_programme_type_id,
      this.finalizeCourse.semester_id,
      this.finalizeCourse.course_id,
      1,
      this.finalizeCourse.dean_committee_id,
      this.finalizeCourse.college_id
    );

    // Refresh course list
    this.getCourseAttendanceList_Btn_click();
  }

  hasAllowedDesignation(allowed: number[]): boolean {
    return allowed.some(id => this.user?.designation_arr?.includes(id));
  }


  getPdf(): void {
    let { academic_session_id, college_id, degree_programme_type_id, semester_id, course_id } =
      this.finalizeCourseFilterFormGroup.value;

    const selectedAcademicSession = this.state.acadmcSesnList.find(
      (s: any) => s.academic_session_id === academic_session_id
    );
    const selectedCollege = this.state.collegeList.find(
      (c: any) => c.college_id === college_id
    );
    let selectedDegreeProTy = this.state.degreeProgrammeTypeList
      .filter((degreeProT: any) => degreeProT.degree_programme_type_id === degree_programme_type_id);

    let selectedCourse = this.state.courseList
      .filter((cor: any) => cor.course_id === course_id);

    let selectedSemester = this.state.semesterList
      .filter((sem: any) => sem.semester_id === semester_id);


    let type = this.attendanceOperation.attendanceUpdate ?
      "Total Student List" : this.attendanceOperation.finalize ? "Attendance Not-Finalize Student List" : "Attendance Finalize Student List"

    // console.log("this.options?.orientation : ", this.options?.orientation);
    // const html = this.print_content.nativeElement.innerHTML;
    const html = document.getElementById('print-section')?.innerHTML;

    this.HTTP.postBlob(`/file/post/htmltoPdf`, {
      html,
      title: `${type} ${selectedAcademicSession?.academic_session_name_e}`,
      academic_session_name_e: selectedAcademicSession?.academic_session_name_e,
      college_name_e: selectedCollege?.college_name_e,
      degree_programme_type_name_e: selectedDegreeProTy[0]?.degree_programme_type_name_e,
      course_title_e: selectedCourse[0]?.course_name,
      semester_name_e: selectedSemester[0]?.semester_name_e
      // orientation: 'landscape'
    }, "Attendance_Status_Report", "common").pipe(take(1)).subscribe(() => console.log("PDF Generated"));
  }
}