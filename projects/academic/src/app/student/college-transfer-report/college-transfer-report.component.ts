import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environment';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-college-transfer-report',
  standalone: false,
  templateUrl: './college-transfer-report.component.html',
  styleUrl: './college-transfer-report.component.scss'
})
export class CollegeTransferReportComponent implements OnInit {
  getCollegeTransferDetailsForm!: FormGroup;
  studentDetails: any = null;
  file_prefix: string = environment.filePrefix;
  degree_id: number = 0;
  state = {
    academicSessionList: [] as any,
    degreeProgrammeList: [] as any,
    collegeList: [] as any,
    semesterList: [] as any,
    getCourseYear: [] as any,
  }

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.getAcademicSession();
    this.getCollegeData();
    this.getSemesterData();
    this.getCourseYearData();
  }

  getStudentListOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    // button: [],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "Transfered Student Details"
  };

  createForm() {
    this.getCollegeTransferDetailsForm = this.fb.group({
      academic_session_id: ['', Validators.required],
      college_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      course_year_id: ['', Validators.required],
      university_order_ref_no: ['']
    });
  }

  getStudentListForSRC_Btn_click(actionType: string) {
    // clear old data
    this.getStudentListOptions.dataSource = [];
    this.getStudentListOptions.listLength = 0;

    // console.log("Form Value:", this.getCollegeTransferDetailsForm.value);
    if (actionType === 'refresh') {
      this.getCollegeTransferDetailsForm.reset();
    }
    if (actionType === 'show') {
      let { academic_session_id, college_id, semester_id, course_year_id } = this.getCollegeTransferDetailsForm.value
      // Validate required fields
      if (!academic_session_id || !college_id || !semester_id || !course_year_id) {
        return this.alert.alertMessage("All Fields are Required", "", "warning");
      }

      // call API to get data
      this.http.getParam('/studentProfile/get/getCollegeTransferredStudentList',
        {
          academic_session_id,
          college_id,
          semester_id,
          course_year_id,
        },
        'academic')
        .subscribe(
          (result: any) => {
            // console.log("result?.body==> ", result?.body);
            if (result?.body?.data?.length === 0) {
              this.alert.alertMessage("Invalid User", "No Records Found in Databse", "error");
            } else if (result?.body?.error?.message) {
              this.alert.alertMessage(result?.body?.error?.message || "No Degree Found OR Invalid UE ID", "", "error");
            }
            else {
              let data = result?.body?.data || [];
              this.getStudentListOptions.dataSource = data;
              this.getStudentListOptions.listLength = data.length;
            }
          },
          (error) => {
            console.error('Error in getStudentListForCollegeTransfer:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }

  //* step: 1
  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("acadmcSessionList : ", result);
          this.state.academicSessionList = result.body.data;
        },
        (error) => {
          console.error('Error in acadmcSessionList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  //* step: 2
  getCollegeData() {
    this.http.getParam('/master/get/getCollege',
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

  //* step: 3
  getSemesterData() {
    this.http.getParam('/master/get/getSemesterList', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("semesterList : ", result.body.data);
          this.state.semesterList = result.body.data;
        },
        (error) => {
          console.error('Error in semesterList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  //* step: 4
  getCourseYearData() {
    this.http.getParam('/master/get/getCourseYear', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("getCourseYear : ", result.body.data);
          this.state.getCourseYear = result.body.data;
        },
        (error) => {
          console.error('Error in getCourseYear:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      )
  }



}
