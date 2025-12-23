import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'shared';

@Component({
  selector: 'app-applied-students-dashboard',
  standalone: false,
  templateUrl: './applied-students-dashboard.component.html',
  styleUrl: './applied-students-dashboard.component.scss'
})
export class AppliedStudentsDashboardComponent implements OnInit {

  dashboardForm!: FormGroup;
  dateFilterForm!: FormGroup;

  academicSessions: any[] = [];
  semesterList: any[] = [];
  valuationTypes: any[] = [];
  valuationData: any[] = [];
  filteredValuationData: any[] = [];
  isSearchPerformed: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.buildDateFilterForm();
    this.getAcademicSession();
    this.getSemester();
    this.getValuationTypes();
  }

  buildForm() {
    this.dashboardForm = this.fb.group({
      academicSession: ['', Validators.required],
      semester: ['', Validators.required],
      valuationType: ['', Validators.required],
    });
  }

  buildDateFilterForm() {
    this.dateFilterForm = this.fb.group({
      fromDate: [''],
      toDate: ['']
    });
  }

  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession/', {}, 'academic')
      .subscribe((res: any) => {
        this.academicSessions = res?.body?.data || [];
        console.log(res);
      });
  }

  getSemester() {
    this.http.getParam('/master/get/getSemesterList/', {}, 'academic')
      .subscribe((res: any) => {
        this.semesterList = res?.body?.data || [];
        console.log(res);
      });
  }

  getValuationTypes() {
    this.http.getParam('/master/get/getValuationType/', {}, 'academic')
      .subscribe((res: any) => {
        this.valuationTypes = res?.body?.data || [];
        console.log(res);
      });
  }

  getDetails() {
    if (this.dashboardForm.invalid) {
      this.dashboardForm.markAllAsTouched();
      return;
    }

    this.isSearchPerformed = true;
    const params = {
      applied_academic_session_id: this.dashboardForm.value.academicSession,
      applied_semester_id: this.dashboardForm.value.semester,
      valuation_type_id: this.dashboardForm.value.valuationType
    };

    console.log('Selected Valuation Type ID:', this.dashboardForm.value.valuationType);
    console.log('Available Valuation Types:', this.valuationTypes);

    const selectedValuationType = this.valuationTypes.find(
      vt => vt.valuation_type_id === this.dashboardForm.value.valuationType
    );
    
    console.log('Found Valuation Type:', selectedValuationType);

    this.http
      .getParam('/markEntry/get/getValuationTypeAppliedData/', params, 'academic')
      .subscribe((res: any) => {
        this.valuationData = res?.body?.data || [];
        this.filteredValuationData = [...this.valuationData]; // Initialize filtered data
        
        this.updateTableOptions(selectedValuationType);
        
        // Reset date filters when new data is loaded
        this.dateFilterForm.reset();
      });
  }

  applyDateFilter() {
    const fromDate = this.dateFilterForm.value.fromDate;
    const toDate = this.dateFilterForm.value.toDate;

    if (!fromDate && !toDate) {
      // If no dates selected, show all data
      this.filteredValuationData = [...this.valuationData];
      this.updateTableOptions();
      return;
    }

    this.filteredValuationData = this.valuationData.filter(item => {
      const itemDate = new Date(item.DATE);
      
      // Reset time part for accurate date comparison
      itemDate.setHours(0, 0, 0, 0);
      
      let isValid = true;

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        isValid = isValid && itemDate >= from;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        isValid = isValid && itemDate <= to;
      }

      return isValid;
    });

    this.updateTableOptions();
  }

  clearDateFilter() {
    this.dateFilterForm.reset();
    this.filteredValuationData = [...this.valuationData];
    this.updateTableOptions();
  }

  updateTableOptions(selectedValuationType?: any) {
    this.studentListoptions.dataSource = this.filteredValuationData;
    this.studentListoptions.listLength = this.filteredValuationData.length;
    
    if (selectedValuationType) {
      this.studentListoptions.title = `Students Applied List - ${selectedValuationType.valuation_type_name_e}`;
    }
  }

  studentListoptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['pdf', 'excel', 'print'],
    is_render: true,
    page: 0,
    pageSize: 10,
    title: '',
  };
}