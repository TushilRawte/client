import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService, HttpService } from 'shared';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-degree-completed-data',
  standalone: false,
  templateUrl: './degree-completed-data.component.html',
  styleUrl: './degree-completed-data.component.scss'
})
export class DegreeCompletedDataComponent {

 academicSessionList: any[] = [];
  degreeProgramTypeList: any[] = [];

  // DATA CONTAINERS
  studentList: any[] = []; // Raw data from API
  filteredStudentList: any[] = []; // Data after Search Filter applied
  paginatedStudentList: any[] = []; // Data for current page

  // Selected values
  selectedDegreeProgramTypeId: any = '';
  selectedAcademicSessionId: any = '';

  // Pagination & Search
  searchText: string = ''; // [NEW] Search Model
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  totalPages = 0;

  constructor(private http: HttpService, private alert: AlertService) {}

  ngOnInit(): void {
    this.getAcademicSession();
    this.getDegreeProgramType();
  }

  // ... (getAcademicSession and getDegreeProgramType remain same) ...
  getAcademicSession() {
    this.http
      .getData('/master/get/getAcademicSession', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.academicSessionList = res.body.data;
      });
  }
  getDegreeProgramType() {
    this.http
      .getData('/master/get/getDegreeProgramType', 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data) this.degreeProgramTypeList = res.body.data;
      });
  }

  // --- GET DATA ---
  getStudentList() {
    if (!this.selectedAcademicSessionId || !this.selectedDegreeProgramTypeId) {
      this.alert.alert(
        true,
        'Please select both Academic Session and Degree Type.'
      );
      return;
    }

    const params = {
      degree_completed_session_id: this.selectedAcademicSessionId,
      degree_programme_type_id: this.selectedDegreeProgramTypeId,
    };

    this.http
      .getParam('/master/get/getDegreeData', params, 'academic')
      .subscribe((res: any) => {
        if (res?.body?.data && res.body.data.length > 0) {
          this.studentList = res.body.data;

          // [NEW] Reset Search and Apply initial filter (which just copies list)
          this.searchText = '';
          this.applyFilter();
        } else {
          this.studentList = [];
          this.filteredStudentList = [];
          this.paginatedStudentList = [];
          this.alert.alert(true, 'No student records found.');
        }
      });
  }

  // --- [NEW] SEARCH LOGIC ---
  applyFilter() {
    // 1. Filter the main list based on search text
    const term = this.searchText.trim().toLowerCase();

    if (!term) {
      this.filteredStudentList = [...this.studentList];
    } else {
      this.filteredStudentList = this.studentList.filter(
        (std) =>
          (std.ue_id && std.ue_id.toString().toLowerCase().includes(term)) ||
          (std.student_name_e &&
            std.student_name_e.toLowerCase().includes(term)) ||
          (std.college_name && std.college_name.toLowerCase().includes(term))
      );
    }

    // 2. Reset to Page 1 whenever search results change
    this.currentPage = 1;

    // 3. Recalculate Pagination based on FILTERED list
    this.calculatePagination();
  }

  // --- PAGINATION LOGIC ---
  calculatePagination() {
    const size = Number(this.pageSize);
    // Use filteredStudentList length!
    this.totalPages = Math.ceil(this.filteredStudentList.length / size) || 1;
    this.updatePaginatedList();
  }

  updatePaginatedList() {
    const size = Number(this.pageSize);
    const start = (this.currentPage - 1) * size;
    const end = start + size;

    // Slice from the FILTERED list
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

  exportToExcel() {
    if (this.filteredStudentList.length === 0) {
      this.alert.alert(true, 'No data to export');
      return;
    }

    // 1. Get Selected Dropdown Names (for Header & Filename)
    const sessionObj = this.academicSessionList.find(
      (x) => x.academic_session_id == this.selectedAcademicSessionId
    );
    const degreeTypeObj = this.degreeProgramTypeList.find(
      (x) => x.degree_programme_type_id == this.selectedDegreeProgramTypeId
    );

    const sessionName = sessionObj
      ? sessionObj.academic_session_name_e
      : 'Unknown_Session';
    const degreeTypeName = degreeTypeObj
      ? degreeTypeObj.degree_programme_type_name_e
      : 'Unknown_Type';

    // 2. Generate Dynamic Filename (Sanitize slashes to underscores)
    // Example: "2023-24_UG_Degree_Data.xlsx"
    const safeSession = sessionName.replace(/[\/\\]/g, '-');
    const safeType = degreeTypeName.replace(/[\/\\]/g, '-');
    const fileName = `${safeSession}_${safeType}_Degree_Data.xlsx`;

    // 3. Prepare Excel Content (Array of Arrays approach)
    const excelData = [];

    // -- Add Metadata Rows at the Top --
    excelData.push(['Academic Session:', sessionName]);
    excelData.push(['Degree Programme Type:', degreeTypeName]);
    excelData.push(['Report Date:', new Date().toLocaleDateString()]);
    excelData.push([]); // Empty spacer row

    // -- Add Table Headers --
    const headers = [
      'S.No.',
      'UE ID',
      'Student Name (English)',
      'Student Name (Hindi)',
      'College',
      'Notification Date',
    ];
    excelData.push(headers);

    // -- Add Table Data --
    this.filteredStudentList.forEach((item, index) => {
      excelData.push([
        index + 1,
        item.ue_id,
        item.student_name_e,
        item.student_name_h,
        item.college_name,
        item.date_of_notification || '-',
      ]);
    });

    // 4. Create Sheet from Array of Arrays (AOA)
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

    // Optional: Adjust column widths for better readability
    ws['!cols'] = [
      { wch: 10 }, // S.No
      { wch: 15 }, // UE ID
      { wch: 30 }, // Name E
      { wch: 30 }, // Name H
      { wch: 40 }, // College
      { wch: 15 }, // Date
    ];

    // 5. Create Workbook and Download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Degree Data');
    XLSX.writeFile(wb, fileName);
  }
}

