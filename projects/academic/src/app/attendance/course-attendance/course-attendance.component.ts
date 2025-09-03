import { Component, OnInit } from '@angular/core'; // Import OnInit
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-course-attendance',
  standalone: false,
  templateUrl: './course-attendance.component.html',
  styleUrl: './course-attendance.component.scss'
})
export class CourseAttendanceComponent implements OnInit {

  acadmcSesnList: any = [];
  semesterList: any = [];
  degreeProgrammeTypeList: any = [];
  finalizeCourse: any = {}
  user: any = {
    emp_id: 100001,
    designation_arr: [327],
  };
  showEmpIdField: boolean = false;
  selectAllUnfinalized: boolean = true; // Default checked
  courseAttendanceList: any = [];
  courseAttendanceStudentList: any = [];
  attendanceStatusList: any = [];
  finalizeCourseFilterFormGroup!: FormGroup;
  finalizeCourseAttendanceFormGroup!: FormGroup;
  globalAttendanceStatusId: number = 1; // Default global status
  selectedCourseFilterData: any;
  selectedCourseAttedanceData: any;
  groupedStudents: any[] = [];

  attendanceTableOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 5,
    is_pagination: true,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    is_render: true,
    page: 0,
    pageSize: 10
  };

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) { }


  ngOnInit(): void {
    //^ Set flag to true if the user has any allowed designation
    this.showEmpIdField = this.hasAllowedDesignation([327, 342, 2423]);
    this.sortCourseAttendanceStudentList();
    this.getAcademicSession(); // ~ load academic session
    this.getDegreeProgrammeTypeData(); // ~ load degree programm type
    this.getSemester(); // ~ load semester
    this.finalizeCourseFilterForm(); // * invoke form dropdown form
  }
  // Utility method to check designation access
  hasAllowedDesignation(allowed: number[]): boolean {
    return allowed.some(id => this.user?.designation_arr?.includes(id));
  }

  // * ng init invoke form dropdown form
  finalizeCourseFilterForm() {
    this.finalizeCourseFilterFormGroup = this.fb.group({
      emp_id: [this.user.emp_id, Validators.required],
      academic_session_id: ['', Validators.required],
      degree_programme_type_id: ['', Validators.required],
      semester_id: ['', Validators.required],
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

  get studentsFormArray(): FormArray {
    return this.finalizeCourseAttendanceFormGroup.get('students') as FormArray;
  }

  initializeStudentsFormArray() {
    this.studentsFormArray.clear();

    for (let student of this.courseAttendanceStudentList) {
      this.studentsFormArray.push(this.createStudentFormGroup(student));
    }
  }

  createStudentFormGroup(student: any): FormGroup {
    return this.fb.group({
      registration_id: [student.registration_id, Validators.required],
      subject_id: [student.subject_id, Validators.required],
      course_id: [this.finalizeCourse.course_id, Validators.required], // From selected course
      course_nature_id: [student.course_nature_id, Validators.required],
      attendance_status_id: [student.attendance_status_id ?? this.globalAttendanceStatusId, Validators.required],
      selected: [false]
    });
  }

  onSelectAllAttendanceStatus(selectedStatusId: number): void {
    this.studentsFormArray.controls.forEach((studentGroup: AbstractControl) => {
      studentGroup.get('attendance_status_id')?.setValue(selectedStatusId);
    });
  }

  getAttendanceStatusLabel(item: any): string {
    const studentsCount = Number(item.student_count);
    const finalize = Number(item.finalize);
    const pending = Number(item.pending);

    if (studentsCount === finalize) {
      return `<span class='bg-success badge rounded-pill p-3'>Done</span>`;
    } else {
      return `<span class='badge bg-info me-1 text-dark'>Pending = ${pending}</span>
            <span class='badge bg-warning text-dark'>Finalize = ${finalize}</span>`;
    }
  }

  getClassForFinalizeStudents(item: any): string {
    return (item.attendance_status_id &&
      (item.attendance_status_id === 1
        || item.attendance_status_id === 2
        || item.attendance_status_id === 3
      )
    )
      ? 'background-color: #BDF9C2'
      : '';
  }

  sortCourseAttendanceStudentList(): void {
    if (!this.courseAttendanceStudentList) return;

    this.courseAttendanceStudentList.sort((a: any, b: any) => {
      const aAllPending = a.student_data?.every((s: any) => !s.attendance_status_id || s.attendance_status_id === 0);
      const bAllPending = b.student_data?.every((s: any) => !s.attendance_status_id || s.attendance_status_id === 0);
      return Number(!aAllPending) - Number(!bAllPending);
    });
  }

  sortCourseAttendanceList(): void {
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
      const shouldSelect = matchedStudent && (!matchedStudent.attendance_status_id || matchedStudent.attendance_status_id === 0);
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
        ctrl.get('subject_id')?.value === record.subject_id &&
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

  prepareGroupedStudents() {
    const groupedMap = new Map<string, any>();

    this.courseAttendanceStudentList.forEach((student: any, index: any) => {
      const key = `${student.attendance_status_id === 0 || student.attendance_status_id === null ? 'unfinalized' : 'finalized'}-${student.subject_name_e}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          subject_name_e: student.subject_name_e,
          group_type: student.attendance_status_id === 0 || student.attendance_status_id === null ? 'unfinalized' : 'finalized',
          records: [],
        });
      }

      const group = groupedMap.get(key);
      group.records.push({
        ...student,
        formIndex: index,
      });
    });

    // Convert map to array and sort: unfinalized groups first, then finalized
    const groupedArray = Array.from(groupedMap.values());
    this.groupedStudents = [
      ...groupedArray.filter(g => g.group_type === 'unfinalized'),
      ...groupedArray.filter(g => g.group_type === 'finalized'),
    ];
  }


  // ~ ng init load academic session
  getAcademicSession() {
    this.HTTP.getParam(
      '/master/get/getAcademicSession1/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data;
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
      this.degreeProgrammeTypeList = result.body.data;
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
      this.semesterList = result.body.data;
    });
  }

  // step 1: button click 
  getCourseAttendanceList_Btn_click() {
    if (this.finalizeCourseFilterFormGroup.invalid) {
      this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const {
      emp_id,
      academic_session_id,
      degree_programme_type_id,
      semester_id
    } = this.finalizeCourseFilterFormGroup.value;

    this.finalizeCourse = {
      emp_id,
      academic_session_id,
      degree_programme_type_id,
      semester_id
    };

    // ✅ Now call the API or function to fetch course attendance
    this.getCourseWiseAttendance(emp_id, academic_session_id, degree_programme_type_id, semester_id);
  }

  // step 2: get status list by employee
  getCourseWiseAttendance(
    emp_id: number,
    academic_session_id: number,
    degree_programme_type_id: number,
    semester_id: number) {
    let params = {
      emp_id: emp_id,
      academic_session_id: academic_session_id,
      degree_programme_type_id: degree_programme_type_id,
      semester_id: semester_id
      // semester_id: this.finalizeCourseFilterFormGroup.get('semester_id')?.value
    }
    // console.log("params getCourseWiseAttendance : ", params);
    this.HTTP.getParam(
      '/attendance/get/getCourseWiseAttendance/',
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
  onStatusClick(item: any): void {
    this.finalizeCourse = { ...this.finalizeCourse, ...item };
    // console.log("onStatusClick finalizeCourse: ", this.finalizeCourse);
    this.getStudentAttendanceList(
      this.finalizeCourse.emp_id,
      this.finalizeCourse.academic_session_id,
      this.finalizeCourse.degree_programme_type_id,
      this.finalizeCourse.semester_id,
      item.course_id,
      2, // course_registration_type_id (you can make this configurable)
      this.finalizeCourse.dean_committee_id
    );
  }

  // step 4: call getStudentAttendanceList()
  getStudentAttendanceList(
    emp_id: number,
    academic_session_id: number,
    degree_programme_type_id: number,
    semester_id: number,
    course_id: number,
    course_registration_type_id: number,
    dean_committee_id: number) {
    let params = {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      emp_id,
      course_id,
      course_registration_type_id,
      dean_committee_id
    }
    this.HTTP.getParam(
      '/attendance/get/getStudentAttendanceList/',
      params,
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        // console.log("getStudentAttendanceList", res.body.data);
        this.courseAttendanceStudentList = res.body.data;
        this.attendanceTableOptions.dataSource = [...this.courseAttendanceStudentList]; // * for printing option
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
    // console.log("kajsodfna-------------------------------");
    // console.log('Selected Students:', selectedStudents);
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

}
