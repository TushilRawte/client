import { Component } from '@angular/core';
import { AuthService, PrintreportService } from 'shared';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';


@Component({
  selector: 'app-registration-card',
  standalone: false,
  templateUrl: './registration-card.component.html',
  styleUrl: './registration-card.component.scss'
})
export class RegistrationCardComponent {

  userData: any = {};
  studentData: any = null;
  stdRegistrationList: any[] = [];
  constructor(public print: PrintService, public print1: PrintreportService, private router: Router, private HTTP: HttpService, private alert: AlertService,private auth: AuthService) {this.userData = this.auth.getSession() }


  tableOptions: any = {
    is_read: true,
    listLength: 0,
    dataSource: [],
    button: [],
  };

 ngOnInit(): void {
    this.getStudentDetails();
    console.log('user data',this.userData);
    
  }


  getStudentDetails() {
    // ^ this data will get from login session
    const academic_session_id = this.userData.academic_session_id;
    const course_year_id = this.userData.course_year_id;
    const semester_id = this.userData.semester_id;
    const college_id = this.userData.college_id;
    const degree_programme_id = this.userData.degree_programme_id;
    const ue_id = this.userData.user_id;

    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id,
      payment: true
    };
    this.HTTP.getParam(
      '/course/get/getStudentList/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.studentData = !result.body.error ? result.body.data[0] : [];
      if (!this.studentData.entrance_exam_type_code) {
      } else {
        this.getListofRegByDegProg()
      }
    });
  }

  getListofRegByDegProg() {
    const college_id = this.userData.college_id;
    const degree_programme_id = this.userData.degree_programme_id;
    const ue_id = this.userData.user_id;

    const params = {
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id,
    };
    this.HTTP.getParam(
      '/master/get/getListofRegByDegProg/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.stdRegistrationList = !result.body.error ? result.body.data : [];

      this.tableOptions.dataSource = this.stdRegistrationList;
      this.tableOptions.listLength = this.stdRegistrationList.length;
    });
  }

  getRegistrationCard(row: any) {
    console.log(row);
    console.log(this.userData);
    

    let regCardTitle = `Registration_Card_${row.ue_id}`
    this.HTTP.postBlob(`/file/post/registrationCardSheetPdf`, {
      // orientation: 'landscape'
      academic_session_id: row.academic_session_id,
      course_year_id: row.course_year_id,
      semester_id: row.semester_id,
      college_id: row.college_id,
      degree_programme_id: row.degree_programme_id,
      ue_id: row.ue_id,
      payee_id: this.userData.payee_id,
      appliedsession: 22,
      appliedsemesterid: 2
    }, regCardTitle, "academic").pipe(take(1))
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

}
