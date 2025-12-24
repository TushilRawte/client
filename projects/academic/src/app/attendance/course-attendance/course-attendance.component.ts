import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';


@Component({
  selector: 'app-course-attendance',
  standalone: false,
  templateUrl: './course-attendance.component.html',
  styleUrl: './course-attendance.component.scss'
})
export class CourseAttendanceComponent implements OnInit {
  state = {
    acadmcSesnList: [] as any[],
    semesterList: [] as any[],
    degreeProgrammeTypeList: [] as any[],
  };

  selectedCourseId: number | null = null;
  selectedOperationType: string | null = null;
  selectedRowData: any = null;

  attendanceOperation: any = {
    attendanceUpdate: false,
    finalize: false,
    unFinalize: false
  }

  finalizeCourse: any = {}
  user: any = {
    emp_id: 100001,
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
  private destroy$ = new Subject<void>();

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) { }

  ngOnInit(): void {
    this.initializeFilterForm(); // Initialize form FIRST

    this.showEmpIdField = this.hasAllowedDesignation([327, 342, 2423]);
    this.getAcademicSession();
    this.getSemester();
    this.getDegreeProgrammeTypeData();
    this.getAttendanceStatus(); // Initialize attendance status

    // Setup value change subscriptions
    this.setupFormValueChanges();
  }

  private setupFormValueChanges(): void {
    const fields = ['emp_id', 'academic_session_id', 'degree_programme_type_id', 'semester_id'];

    fields.forEach(field => {
      this.finalizeCourseFilterFormGroup.get(field)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          this.clearData();
          // if (field === 'academic_session_id' && value) {
          //   const semesterId = this.finalizeCourseFilterFormGroup.get('semester_id')?.value;
          //   const degreeProgrammeTypeId = this.finalizeCourseFilterFormGroup.get('degree_programme_type_id')?.value;

          //   if (semesterId && degreeProgrammeTypeId) {
          //     this.getCourseData(value, semesterId, degreeProgrammeTypeId);
          //   }
          // }
        });
    });
  }

  private clearData(): void {
    this.groupedStudents = [];
    this.courseAttendanceList = [];
    this.courseAttendanceStudentList = [];
    if (this.finalizeCourseAttendanceFormGroup) {
      this.finalizeCourseAttendanceFormGroup.reset();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }


  initializeFilterForm() {
    this.finalizeCourseFilterFormGroup = this.fb.group({
      emp_id: [this.user.emp_id, Validators.required],
      academic_session_id: ['', Validators.required],
      degree_programme_type_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      attendance_status_id: ['']
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

  // createStudentFormGroup(student: any): FormGroup {
  //   // Determine if student should be selectable based on operation
  //   let selectedDisabled = false;

  //   if (this.attendanceOperation.attendanceUpdate) {
  //     // For update: only allow if not finalized
  //     selectedDisabled = student.attendance_finalize_yn === 'Y';
  //   } else if (this.attendanceOperation.finalize) {
  //     // For finalize: only allow if not already finalized
  //     selectedDisabled = student.attendance_finalize_yn === 'Y';
  //   } else if (this.attendanceOperation.unFinalize) {
  //     // For unfinalize: only allow if already finalized
  //     selectedDisabled = student.attendance_finalize_yn === 'N';
  //   }

  //   // Determine if attendance status should be editable
  //   const attendanceStatusDisabled =
  //     this.attendanceOperation.finalize ||
  //     this.attendanceOperation.unFinalize ||
  //     student.attendance_finalize_yn === 'Y';

  //   return this.fb.group({
  //     registration_id: [student.registration_id, Validators.required],
  //     ue_id: [student.ue_id, Validators.required],
  //     degree_programme_id: [student.degree_programme_id, Validators.required],
  //     course_id: [this.finalizeCourse.course_id, Validators.required],
  //     course_nature_id: [student.course_nature_id, Validators.required],
  //     attendance_status_id: [{
  //       value: student.attendance_status_id || this.globalAttendanceStatusId,
  //       disabled: attendanceStatusDisabled
  //     }, Validators.required],
  //     selected: [{ value: false, disabled: selectedDisabled }],
  //   });
  // }

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

    // Handle null attendance_status_id - use global default
    let attendanceStatusId = student.attendance_status_id;

    // If attendance_status_id is null and student is not finalized, use global default
    if (attendanceStatusId === null && student.attendance_finalize_yn !== 'Y') {
      attendanceStatusId = this.globalAttendanceStatusId;
    }
    // If still null (for finalized students), use 1 as fallback
    else if (attendanceStatusId === null) {
      attendanceStatusId = 1; // or whatever your default status ID is
    }

    return this.fb.group({
      registration_id: [student.registration_id, Validators.required],
      ue_id: [student.ue_id, Validators.required],
      degree_programme_id: [student.degree_programme_id, Validators.required],
      course_id: [this.finalizeCourse.course_id, Validators.required],
      course_nature_id: [student.course_nature_id, Validators.required],
      attendance_status_id: [{
        value: attendanceStatusId,
        disabled: attendanceStatusDisabled
      }, Validators.required],
      selected: [{ value: false, disabled: selectedDisabled }],
    });
  }

  get studentsFormArray(): FormArray {
    return this.finalizeCourseAttendanceFormGroup?.get('students') as FormArray;
  }

  // initializeStudentsFormArray() {
  //   if (!this.finalizeCourseAttendanceFormGroup) return;

  //   const studentsArray = this.studentsFormArray;
  //   studentsArray.clear();

  //   this.courseAttendanceStudentList?.forEach((student: any) => {
  //     studentsArray.push(this.createStudentFormGroup(student));
  //   });

  //   // Apply global status after initialization
  //   this.onSelectAllAttendanceStatus(this.globalAttendanceStatusId);
  // }

  initializeStudentsFormArray() {
    if (!this.finalizeCourseAttendanceFormGroup) return;

    const studentsArray = this.studentsFormArray;
    studentsArray.clear();

    // Set globalAttendanceStatusId based on the operation
    // For first-time attendance (null values), set to default "Present" status (assuming 1 = Present)
    if (this.courseAttendanceStudentList?.some((s: any) => s.attendance_status_id === null)) {
      this.globalAttendanceStatusId = 1; // Default to "Present" for new entries
    }

    this.courseAttendanceStudentList?.forEach((student: any) => {
      studentsArray.push(this.createStudentFormGroup(student));
    });
  }

  // onSelectAllAttendanceStatus(selectedStatusId: number): void {
  //   if (!this.studentsFormArray) return;

  //   this.studentsFormArray.controls.forEach((studentGroup: AbstractControl) => {
  //     if (!studentGroup.get('attendance_status_id')?.disabled) {
  //       studentGroup.get('attendance_status_id')?.setValue(selectedStatusId);
  //     }
  //   });
  // }

  onSelectAllAttendanceStatus(selectedStatusId: number): void {
    if (!this.studentsFormArray) return;

    // Update the global status
    this.globalAttendanceStatusId = selectedStatusId;

    this.studentsFormArray.controls.forEach((studentGroup: AbstractControl, index: number) => {
      const studentData = this.courseAttendanceStudentList[index];
      const isDisabled = studentGroup.get('attendance_status_id')?.disabled;

      // Only update if:
      // 1. Control is not disabled
      // 2. AND student is not finalized
      // 3. OR if student has null attendance_status_id (first time)
      if (!isDisabled && studentData.attendance_finalize_yn !== 'Y') {
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

    // First, group students by degree programme
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

    // Convert map to array and sort groups if needed
    this.groupedStudents = Array.from(groupedMap.values());

    // Sort groups by degree programme name
    this.groupedStudents.sort((a, b) =>
      a.degree_programme_name_e.localeCompare(b.degree_programme_name_e)
    );

    let globalIndex = 1;

    // Sort records within each group and assign sequential index
    this.groupedStudents = this.groupedStudents.map((group: any) => {
      // Sort records: First by finalize status, then by student name
      group.records.sort((a: any, b: any) => {
        // If names are the same, sort by finalize status (Y before N)
        if (a.attendance_finalize_yn !== b.attendance_finalize_yn) {
          return a.attendance_finalize_yn === 'Y' ? 1 : -1; // 'N' comes before 'Y'
        }
        // then sort by student name alphabetically
        const nameCompare = (a.student_name || '').localeCompare(b.student_name || '');
        if (nameCompare !== 0) return nameCompare;

        return 0;
      });

      // Assign sequential global index
      group.records.forEach((student: any) => {
        student.index = globalIndex++;
      });

      return group;
    });
  }

  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession/', {}, 'academic')
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

  getCourseAttendanceList_Btn_click() {
    if (this.finalizeCourseFilterFormGroup.invalid) {
      this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }

    // Clear previous selection
    this.clearSelection();

    const formValue = this.finalizeCourseFilterFormGroup.value;
    this.finalizeCourse = { ...formValue };

    this.getCourseWiseAttendance(
      formValue.academic_session_id,
      formValue.semester_id,
      formValue.degree_programme_type_id,
      1, // exam_type_id
      formValue.emp_id,
      1
    );
  }

  getCourseWiseAttendance(
    academic_session_id: number,
    semester_id: number,
    degree_programme_type_id: number,
    exam_type_id: number,
    emp_id: number,
    course_registration_type_id: number) {
    const params = {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      exam_type_id,
      emp_id,
      course_registration_type_id
    };

    this.HTTP.getParam('/attendance/get/getCourseWiseAttendance', params, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          this.courseAttendanceList = res.body.data || [];
          if (this.courseAttendanceList.length > 0) {
            this.courseAttendanceStudentList = [];
            this.groupedStudents = [];
          } else {
            this.alert.alertMessage("No Records Found There!", "", "warning");
          }
        } else {
          this.alert.alertMessage(res.body?.error?.message || res.body?.error, "Failed to load course attendance", "warning");
        }
      }, (error) => {
        console.error('Error in getCourseWiseAttendance:', error);
        this.alert.alertMessage("Error", "Network error occurred", "error");
      });
  }

  onStatusClick(item: any, operation: string): void {
    // Set selected row data
    this.selectedCourseId = item.course_id;
    this.selectedOperationType = operation;
    this.selectedRowData = item;

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
      this.finalizeCourse.emp_id,
      this.finalizeCourse.academic_session_id,
      this.finalizeCourse.degree_programme_type_id,
      this.finalizeCourse.semester_id,
      item.course_id,
      // this.finalizeCourse.course_id,
      1, // course_registration_type_id (you can make this configurable)
      this.finalizeCourse.dean_committee_id,
    );
  }

  getStudentAttendanceList(
    emp_id: number,
    academic_session_id: number,
    degree_programme_type_id: number,
    semester_id: number,
    course_id: number,
    course_registration_type_id: number,
    dean_committee_id: number) {
    let params: any = {
      emp_id,
      academic_session_id,
      degree_programme_type_id,
      semester_id,
      course_id,
      course_registration_type_id,
      dean_committee_id,
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
          if (this.courseAttendanceStudentList.length > 0) {
            this.initializeStudentForm();
            this.prepareGroupedStudents();

            // Auto-select all by default
            this.onToggleSelectAll(true);
          } else {
            this.alert.alertMessage("No Records Found There!", "", "warning");
          }
        } else {
          this.alert.alertMessage(res.body?.error?.message || res.body?.error, "Failed to load student list", "warning");
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
      this.finalizeCourse.emp_id,
      this.finalizeCourse.academic_session_id,
      this.finalizeCourse.degree_programme_type_id,
      this.finalizeCourse.semester_id,
      this.finalizeCourse.course_id,
      1, // course_registration_type_id (you can make this configurable)
      this.finalizeCourse.dean_committee_id,
    );


    // Refresh course list
    this.getCourseAttendanceList_Btn_click();
  }

  hasAllowedDesignation(allowed: number[]): boolean {
    return allowed.some(id => this.user?.designation_arr?.includes(id));
  }


  getPdf(): void {
    let { academic_session_id, degree_programme_type_id, semester_id, course_id } =
      this.finalizeCourseFilterFormGroup.value;

    const selectedAcademicSession = this.state.acadmcSesnList.find(
      (s: any) => s.academic_session_id === academic_session_id
    );

    let selectedDegreeProTy = this.state.degreeProgrammeTypeList
      .filter((degreeProT: any) => degreeProT.degree_programme_type_id === degree_programme_type_id);

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
      degree_programme_type_name_e: selectedDegreeProTy[0]?.degree_programme_type_name_e,
      semester_name_e: selectedSemester[0]?.semester_name_e
      // orientation: 'landscape'
    }, "Attendance_Status_Report", "common").pipe(take(1)).subscribe(() => console.log("PDF Generated"));
  }


  hasNullAttendanceStatus(): boolean {
    return this.courseAttendanceStudentList?.some((student: any) =>
      student.attendance_status_id === null && student.attendance_finalize_yn !== 'Y'
    );
  }

  isRowSelected(item: any): boolean {
    return this.selectedCourseId === item.course_id &&
      this.selectedOperationType !== null;
  }


  clearSelection(): void {
    this.selectedCourseId = null;
    this.selectedOperationType = null;
    this.selectedRowData = null;
  }

}