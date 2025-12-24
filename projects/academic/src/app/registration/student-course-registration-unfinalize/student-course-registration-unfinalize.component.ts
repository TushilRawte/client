import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService, HttpService } from 'shared';

@Component({
  selector: 'app-student-course-registration-unfinalize',
  standalone: false,
  templateUrl: './student-course-registration-unfinalize.component.html',
  styleUrl: './student-course-registration-unfinalize.component.scss'
})
export class StudentCourseRegistrationUnfinalizeComponent {
 // ... [Existing Dropdown Properties] ...
  academicSession: any[] = [];
  degreeProgramTypeList: any[] = [];
  degreeProgramList: any[] = [];
  collegeList: any[] = [];
  courseYearList: any[] = [];
  semesterList: any[] = [];

  // ... [Existing Selection Properties] ...
  selectedDegreeProgramTypeList: any = '';
  selectedAcademicSession: any = '';
  selectedDegreeProgram: any = '';
  selectedCollege: any = '';
  selectedCourseYear: any = '';
  selectedSemester: any = '';

  // Data & Filter Properties
  studentList: any[] = []; // Master list
  filteredStudentList: any[] = []; // List after search filter
  paginatedStudentList: any[] = []; // List for current page (NEW)

  searchText: string = '';

  // Pagination Properties (NEW)
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  totalPages = 0;

  constructor(private http: HttpService, private alert: AlertService) {}

  ngOnInit(): void {
    this.getAcademicStatus();
    this.getDegreeProgramType();
    this.getCourseYear();
    this.getSemesterList();
  }

  // ... [Keep your existing GET MASTER functions here] ...
  getAcademicStatus() {
    this.http
      .getData('/master/get/getAcademicSession', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.academicSession = res.body.data;
      });
  }
  // ... (Other master get functions same as before) ...

  getDegreeProgramType() {
    this.http
      .getData('/master/get/getDegreeProgramType', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.degreeProgramTypeList = res.body.data;
      });
  }

  getDegreeProgram(typeId: number) {
    // ... (Existing logic) ...
    this.degreeProgramList = [];
    this.selectedDegreeProgram = '';
    if (typeId) {
      const params = { degree_programme_type_id: typeId };
      this.http
        .getParam('/master/get/getDegreeProgramme', params, 'academic')
        .subscribe((res: any) => {
          if (res?.body?.data) this.degreeProgramList = res.body.data;
        });
    }
  }

  getCollege(typeId: number) {
    // ... (Existing logic) ...
    this.collegeList = [];
    this.selectedCollege = '';
    if (typeId) {
      const params = { degree_programme_type_id: typeId };
      this.http
        .getParam('/master/get/getCollegeList', params, 'academic')
        .subscribe((res: any) => {
          if (res?.body?.data) this.collegeList = res.body.data;
        });
    }
  }

  getCourseYear() {
    this.http
      .getData('/master/get/getCourseYear', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.courseYearList = res.body.data;
      });
  }

  getSemesterList() {
    this.http
      .getData('/master/get/getSemesterList', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.semesterList = res.body.data;
      });
  }

  onDegreeProgramTypeChange() {
    const typeId = +this.selectedDegreeProgramTypeList;
    if (typeId) {
      this.getDegreeProgram(typeId);
      this.getCollege(typeId);
    } else {
      this.degreeProgramList = [];
      this.selectedDegreeProgram = '';
      this.collegeList = [];
      this.selectedCollege = '';
    }
  }

  // --- SEARCH API LOGIC ---
  getStudentList() {
    // 1. Validation
    if (!this.selectedAcademicSession) {
      this.alert.alert(true, 'Please select Academic Session');
      return;
    }
    if (!this.selectedDegreeProgramTypeList) {
      this.alert.alert(true, 'Please select Degree Programme Type');
      return;
    }
    if (!this.selectedDegreeProgram) {
      this.alert.alert(true, 'Please select Degree Programme');
      return;
    }
    if (!this.selectedCollege) {
      this.alert.alert(true, 'Please select College');
      return;
    }
    if (!this.selectedCourseYear) {
      this.alert.alert(true, 'Please select Course Year');
      return;
    }
    if (!this.selectedSemester) {
      this.alert.alert(true, 'Please select Semester');
      return;
    }

    const params = {
      academic_session_id: this.selectedAcademicSession,
      degree_programme_type_id: this.selectedDegreeProgramTypeList,
      degree_programme_id: this.selectedDegreeProgram,
      college_id: this.selectedCollege,
      course_year_id: this.selectedCourseYear,
      semester_id: this.selectedSemester,
    };

    this.studentList = [];
    this.filteredStudentList = [];
    this.paginatedStudentList = []; // Clear pagination
    this.searchText = '';

    this.http
      .getParam('/course/get/getStudentList', params, 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data && res.body.data.length > 0) {
          this.studentList = res.body.data;
          this.studentList.forEach((s) => (s.action_remark = ''));

          // Initialize Filter & Pagination
          this.filterTable();
        } else {
          this.alert.alert(true, 'No Student Record Found');
        }
      });
  }

  // --- CLIENT SIDE TABLE FILTER & PAGINATION ---
  filterTable() {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredStudentList = [...this.studentList];
    } else {
      const term = this.searchText.toLowerCase();
      this.filteredStudentList = this.studentList.filter(
        (item) =>
          (item.ue_id && item.ue_id.toString().toLowerCase().includes(term)) ||
          (item.registration_id &&
            item.registration_id.toString().toLowerCase().includes(term)) ||
          (item.student_name &&
            item.student_name.toLowerCase().includes(term)) ||
          (item.course_year_name_e &&
            item.course_year_name_e.toLowerCase().includes(term))
      );
    }

    // Reset to page 1 on search
    this.currentPage = 1;
    this.calculatePagination();
  }

  // --- PAGINATION LOGIC (The Fixed Version) ---
  calculatePagination() {
    const size = Number(this.pageSize);
    this.totalPages = Math.ceil(this.filteredStudentList.length / size) || 1;
    this.updatePaginatedList();
  }

  updatePaginatedList() {
    // FORCE NUMBER CONVERSION
    const size = Number(this.pageSize);
    const start = (this.currentPage - 1) * size;
    const end = start + size;

    this.paginatedStudentList = this.filteredStudentList.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedList();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedList();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.calculatePagination();
  }

  // --- UNFINALIZE ACTION ---
  unfinalizeStudent(student: any) {
    if (!student.action_remark || student.action_remark.trim() === '') {
      this.alert.alert(true, 'Please enter a remark before unfinalizing.');
      return;
    }

    this.alert
      .confirmAlert(
        'Confirm Unfinalize',
        'Are you sure you want to unfinalize this student?',
        'warning'
      )
      .then((res: any) => {
        if (res.isConfirmed) {
          const payload = {
            registration_id: student.registration_id,
            ue_id: student.ue_id,
            unfinalize_remark: student.action_remark,
            is_finalize_yn: 'N',
          };

          this.http
            .putData(
              '/course/update/unfinalizeStudentCourse',
              payload,
              'academic'
            )
            .subscribe((apiRes: any) => {
              const body = apiRes?.body;
              if (!body?.error) {
                this.alert.alert(
                  false,
                  body?.message || 'Student Unfinalized Successfully'
                );
                this.getStudentList();
              } else {
                this.alert.alert(
                  true,
                  body?.error?.message || 'An error occurred.'
                );
              }
            });
        }
      });
  }

  resetFilters() {
    this.selectedAcademicSession = '';
    this.selectedDegreeProgramTypeList = '';
    this.selectedDegreeProgram = '';
    this.selectedCollege = '';
    this.selectedCourseYear = '';
    this.selectedSemester = '';
    this.degreeProgramList = [];
    this.collegeList = [];

    this.studentList = [];
    this.filteredStudentList = [];
    this.paginatedStudentList = [];
    this.searchText = '';
  }
}

