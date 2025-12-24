import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';
import { environment } from 'environment';

@Component({
  selector: 'app-pdc-report',
  standalone: false,
  templateUrl: './pdc-report.component.html',
  styleUrl: './pdc-report.component.scss'
})
export class PdcReportComponent implements OnInit {
  getSRCDetailsForm!: FormGroup;
  studentDetails: any = null;
  file_prefix: string = environment.filePrefix;
  degree_id: number = 0;
  state = {
    academicSessionList: [] as any,
    degreeProgrammeList: [] as any,
    collegeList: [] as any
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
    this.getDegreeProgrammeData();
    this.getCollegeData();
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
    title: "Student Details"
  };

  createForm() {
    this.getSRCDetailsForm = this.fb.group({
      academic_session_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      college_id: ['', Validators.required]
    });
  }

  getPDCList_Btn_click(actionType: string) {
    // console.log("Form Value:", this.getSRCDetailsForm.value);
    let { student_id } = this.getSRCDetailsForm.value;
    if (actionType === 'refresh') {
      this.getSRCDetailsForm.reset();
      // clear old data
      this.getStudentListOptions.dataSource = [];
      this.getStudentListOptions.listLength = 0;
    }
    if (actionType === 'show') {
      let { academic_session_id, degree_programme_id, college_id } = this.getSRCDetailsForm.value

      // call API to get data
      this.http.getParam('/studentProfile/get/getStudentListForPDC',
        {
          degree_completed_session: academic_session_id,
          degree_programme_id,
          college_id,
          pdc_gen_yn: 'Y'
        },
        'academic')
        .subscribe(
          (result: any) => {
            // console.log("result?.body==> ", result?.body);
            if (result?.body?.data?.length === 0) {
              this.alert.alertMessage("No Records Found in Databse", "Not Generated for this session", "error");
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
            console.error('Error in getStudentListForPDC:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }


  getPDC(row: any) {
    // console.log("row ====dds>> ", row);
    let { student_id } = row;
    let srcTitle = `Provisional_Degree_Certificate_${student_id}`
    this.http.postBlob(`/file/post/provisionalDegreeCertificatePdf`, {
      // orientation: 'landscape'
      ue_id: student_id,
    }, srcTitle, "academic").pipe(take(1))
      .subscribe(
        (response) => {
          // console.log("response :=> ", response.body);
          const blob = response.body;
          if (blob) {
            // 
          } else {
            this.alert.alertMessage("No Records Found!", "Failed to download report.", "error");
            return
          }
        },
        (error) => {
          console.error('Error downloading PDF:', error);
          this.alert.alertMessage("Something went wrong!", "Failed to download report. Please try again later.", "error");
        }
      );
  }

  downloadAllSRC_btn() {
    this.alert.alertMessage("‘Download All’ will be available soon.", "", "info");
  }


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

  getDegreeProgrammeData() {
    this.http.getParam('/master/get/getDegreeProgramme', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("degreeProgrammeList : ", result);
          this.state.degreeProgrammeList = result.body.data;
        },
        (error) => {
          console.error('Error in degreeProgrammeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  getCollegeData() {
    this.http.getParam('/master/get/getCollegeList',
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


}
