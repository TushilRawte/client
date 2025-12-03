import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';
import { environment } from 'environment';

@Component({
  selector: 'app-src-report',
  standalone: false,
  templateUrl: './src-report.component.html',
  styleUrl: './src-report.component.scss'
})
export class SrcReportComponent {
 getSRCDetailsForm!: FormGroup;
  studentDetails: any = null;
  image_prefix: string = environment.filePrefix;
  degree_id: number = 0;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.createForm();
  }

  getSRCDetailsOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: false,
    dataSource: [],
    // button: ['print', 'pdf', 'copy', 'excel'],
    button: [],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "Student Details"
  };

  getSRCListOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: false,
    dataSource: [],
    button: [],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "List of Generated SRC's"
  };

  createForm() {
    this.getSRCDetailsForm = this.fb.group({
      student_id: ['', Validators.required],
    });
  }

  getStudentDetails_Btn_click(actionType: string) {
    // console.log("Form Value:", this.getSRCDetailsForm.value);
    let { student_id } = this.getSRCDetailsForm.value;
    if (actionType === 'refresh') {
      this.getSRCDetailsForm.reset();
      // clear old data
      this.getSRCDetailsOptions.dataSource = [];
      this.getSRCDetailsOptions.listLength = 0;
      this.getSRCListOptions.dataSource = [];
      this.getSRCListOptions.listLength = 0;
    }
    if (actionType === 'show') {
      // call API to get data
      this.http.getParam('/studentProfile/get/getDegreeListForSRC', {
        ue_id: student_id
      }, 'academic')
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
              this.getSRCDetailsOptions.dataSource = data;
              this.getSRCDetailsOptions.listLength = data.length;

              // clear old data
              this.getSRCListOptions.dataSource = [];
              this.getSRCListOptions.listLength = 0;
            }
          },
          (error) => {
            console.error('Error in getDegreeListForSRC:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }

  getSRCList_btn(row: any) {
    // console.log("row===+++++++++++++++++++++++++=>>> ", row);
    let { ue_id, degree_id } = row;
    this.degree_id = degree_id
    this.http.getParam('/studentProfile/get/getSRCList', {
      ue_id,
      degree_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result?.body --> ", result?.body);
          if (result?.body?.data?.length === 0) {
            this.alert.alertMessage("No SRC Generated until.", "", "error");
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result?.body?.error?.message || "No SRC Generated until.", "", "error");
            this.getSRCListOptions.dataSource = [];
            this.getSRCListOptions.listLength = 0;
          } else {
            let data = result?.body?.data || [];
            this.getSRCListOptions.dataSource = data;
            this.getSRCListOptions.listLength = data.length;
          }
        },
        (error) => {
          console.error('Error in getSRCList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getSRC(row: any) {
    // console.log("row ====dds>> ", { ...row });
    let { student_id } = this.getSRCDetailsForm.value;
    let srcTitle = `Semester_Report_Card_${student_id}`
    this.http.postBlob(`/file/post/semesterReportCardPdf`, {
      // orientation: 'landscape'
      ue_id: student_id,
      src_main_id: row.src_main_id,
      degree_id: this.degree_id,
      exam_type_id: row.exam_type_id,
      academic_session_id: row.academic_session_id,
      semester_id: row.semester_id,
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

}
