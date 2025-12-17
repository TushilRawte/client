import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';
import { environment } from 'environment';

@Component({
  selector: 'app-admit-card-report',
  standalone: false,
  templateUrl: './admit-card-report.component.html',
  styleUrl: './admit-card-report.component.scss'
})
export class AdmitCardReportComponent implements OnInit {
  studentDetails: any = null;
  image_prefix: string = environment.filePrefix;
  degree_id: number = 0;
  ue_id: number = 20242185;
  degree_programme_id: number = 2;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
  }

  ngOnInit(): void {
    this.getAdmitCardList();
  }

  getSRCDetailsOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: false,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    // button: [],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "Admit Card - Report"
  };

  getAdmitCardList() {
    // call API to get data
    this.http.getParam('/studentProfile/get/getAdmitCardList', {
      ue_id: this.ue_id,
      degree_programme_id: this.degree_programme_id
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
          }
        },
        (error) => {
          console.error('Error in getAdmitCardList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  downloadAdmitCard(row: any) {
    // console.log("row --> ", row);
    let srcTitle = `Admit_Card_${this.ue_id}_${row.course_year_name_e}_${row.semester_name_e}_${row.exam_type_name_e}`
    this.http.postBlob(`/file/post/admitCardPdf`, {
      // orientation: 'landscape'
      // ue_id: this.ue_id,
      // src_main_id: row.src_main_id,
      // degree_id: this.degree_id,
      // exam_type_id: row.exam_type_id,
      // academic_session_id: row.academic_session_id,
      // semester_id: row.semester_id,
      admit_card_issue_main_id: row.admit_card_issue_main_id
    }, srcTitle, "academic").pipe(take(1))
      .subscribe(
        (response) => {
          // console.log("response :=> ", response);
          const blob = response.body;
          if (blob) {
            // 
          } else {
            this.alert.alertMessage("No Records Found!", "Failed to download report.", "error");
            return
          }
        },
        (error) => {
          console.error('Error downloading PDF in admitCardPdf:', error);
          this.alert.alertMessage("Something went wrong!", "Failed to download report. Please try again later.", "error");
        }
      );
  }

  downloadAllAdmitCard_btn() {
    this.alert.alertMessage("‘Download All’ will be available soon.", "", "info");
  }

  generateAdmitCard(row: any) {
    let { registration_id } = row;
    this.http.postData('/studentProfile/post/generateAdmitCard', {
      registration_id,
      admit_card_issue_date: new Date()
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("generateAdmitCard====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "Admint Card Generated.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "Error", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getAdmitCardList(); //^ reload page
        },
        (error) => {
          console.error('Error in generateAdmitCard:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });

  }

}
