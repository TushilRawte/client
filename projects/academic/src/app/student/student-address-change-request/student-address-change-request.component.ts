import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, HttpService, PrintService } from 'shared';
import { StudentAddressChangeRequestPopupComponent } from '../student-address-change-request-popup/student-address-change-request-popup.component';

@Component({
  selector: 'app-student-address-change-request',
  standalone: false,
  templateUrl: './student-address-change-request.component.html',
  styleUrl: './student-address-change-request.component.scss'
})
export class StudentAddressChangeRequestComponent  implements OnInit {
  actionType: string | null = null;
  selectedId: string | null = null;
  selectedStudentId: string | null = null;
  selectedStudentUEId: string | null = null;
  selected: { [ue_id: string]: string } = {};
  selectedRowId: number | null = null;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
    private dialog: MatDialog
  ) {

  }

  dashboardListOptions: any = {
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
    title: "Total Requests For Update",
  };

  studentsListOptions: any = {
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
    title: "List of Student Requested Correction",
  };


  ngOnInit(): void {
    this.getDegreeProgrammeTypeData();
  }


  getDegreeProgrammeTypeData() {
    this.http.getParam('/master/get/getDegreeProgramType', {
      studentAddressChangeDashboard: 1
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result.body ==dd==> ", result.body);
          if (result?.body?.error?.message) {
            return this.alert.alertMessage(result?.body?.error?.message, "Cotanct to Admin", "error");
          } else if (result?.body?.error?.sqlMessage) {
            return this.alert.alertMessage(result?.body?.error?.sqlMessage, "Cotanct to Admin", "error");
          }

          let degreeProgrammeTypes = result.body.data;
          this.dashboardListOptions.dataSource = degreeProgrammeTypes;
          this.dashboardListOptions.listLength = degreeProgrammeTypes?.length;
        },
        (error) => {
          console.error('Error in getDegreeProgrammeType:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getStudentListForAddressChangeData(data: any, type: string) {
    this.actionType = type;
    this.selectedRowId = data.degree_programme_type_id;

    this.selectedStudentUEId = data.ue_id;
    this.selectedStudentId = data.student_id;
    this.selected[data.ue_id]
    let status = type === 'pending' ? 'P' : type === 'done' ? 'A' : 'R'
    this.http.getParam('/studentProfile/get/getStudentListForAddressChange', {
      degree_programme_type_id: data.degree_programme_type_id,
      complain_status_par: status,
      // college_id: college_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result.body ==dd==> ", result.body);
          let studentList = result.body.data;
          this.studentsListOptions.dataSource = studentList;
          this.studentsListOptions.listLength = studentList?.length;
        },
        (error) => {
          console.error('Error in getStudentListForAddressChange:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getStudentChangesDetailsData(student: any) {
    // console.log("student ===ddsds>>>> ", student.id);
    this.selectedStudentUEId = student.ue_id;
    this.selectedId = student.id;
    this.selectedStudentId = student.student_id;
    this.http.getParam('/studentProfile/get/getStudentProfileAddressDetails', {
      student_id: student.student_id,
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result.body ==dd==> ", result.body);
          let studentList = result.body.data;

          const dialogRef = this.dialog.open(StudentAddressChangeRequestPopupComponent, {
            width: '900px',
            height: '505px',
            data: studentList,
            // disableClose: true, // optional
            autoFocus: true
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log('Dialog closed with result:', result);
            }
          });

        },
        (error) => {
          console.error('Error in getStudentListForAddressChange:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }


}

