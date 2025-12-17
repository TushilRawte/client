import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
import { environment } from 'environment';

@Component({
  selector: 'app-student-mobile-number-change-request',
  standalone: false,
  templateUrl: './student-mobile-number-change-request.component.html',
  styleUrl: './student-mobile-number-change-request.component.scss'
})
export class StudentMobileNumberChangeRequestComponent implements OnInit {
  file_prefix: string = environment.filePrefix;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
  }

  ngOnInit(): void {
    this.getMatrixData();
  }

  getMobileNumberChangeRequestOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "Mobile Number Change Request"
  };

  approve(row: any) {
    // call API to update student mobile no
    this.http.putData('/studentProfile/update/updateStudentMobileNumber', {
      ue_id: row.ue_id,
      mobile_no: row.new_mobile_no,
      request_id: row.request_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result ===> ", result);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "Mobile Number Updated.", "", "success");
            this.getMatrixData(); //^ reload the page 
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "Error!", "", "error");
          } else {
            this.alert.alertMessage("Mobile Number Update Failed", "", "warning");
          }
        },
        (error) => {
          console.error('Error in updateStudentMobileNumber:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      )
  }

  getMatrixData() {
    this.http.getParam('/studentProfile/get/getStudentMobileNumberChangeRequest', {
      is_resolved: 'N'
    }, 'academic')
      .subscribe(
        (result: any) => {
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "Mobile Number Change Request.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "Error!", "", "error");
          } else if (result?.body?.data?.length > 0) {
            let data = result?.body?.data || [];
            this.getMobileNumberChangeRequestOptions.dataSource = data;
            this.getMobileNumberChangeRequestOptions.listLength = data.length
          } else {
            this.alert.alertMessage("No Records Found", "", "warning");
          }
        },
        (error) => {
          console.error('Error in getStudentMobileNumberChangeRequest:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  // formatDate(dateString: string): string {
  //   if (!dateString) return '';

  //   const d = new Date(dateString);

  //   if (isNaN(d.getTime())) return dateString; // fallback

  //   const day = String(d.getDate()).padStart(2, '0');
  //   const month = String(d.getMonth() + 1).padStart(2, '0');
  //   const year = d.getFullYear(); // full 4-digit year

  //   return `${day}-${month}-${year}`;
  // }

  formatDateWithTime(dateString: string): string {
    if (!dateString) return '';

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // fallback

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }


}
