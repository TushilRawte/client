import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, HttpService, PrintService } from 'shared';
import { StudentBasicDetailsUpdatePopupComponent } from '../student-basic-details-update-popup/student-basic-details-update-popup.component';
import { environment } from 'environment';

@Component({
  selector: 'app-student-basic-details-update',
  standalone: false,
  templateUrl: './student-basic-details-update.component.html',
  styleUrl: './student-basic-details-update.component.scss'
})
export class StudentBasicDetailsUpdateComponent implements OnInit {
  file_prefix: string = environment.filePrefix;
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
    this.http.getParam('/studentProfile/get/getStudentProfileEditReportDashboard', {
      studentProfileEditReportDashboard: 1
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result.body ==dd==> ", result.body);
          if (result?.body?.error?.message) {
            return this.alert.alertMessage(result?.body?.error?.message, "Contact to Admin", "error");
          } else if (result?.body?.error?.sqlMessage) {
            return this.alert.alertMessage(result?.body?.error?.sqlMessage, "Contact to Admin", "error");
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

  getStudentListForBasicDetailsChangeData(data: any, type: string) {
    // console.log("data ===>>> ", data);
    this.actionType = type;
    this.selectedRowId = data.degree_programme_type_id;

    // this.selectedStudentUEId = data.ue_id;
    // this.selectedStudentId = data.student_id;
    // this.selected[data.ue_id]
    let status = type === 'pending' ? 'P' : type === 'done' ? 'A' : 'R'
    this.http.getParam('/studentProfile/get/getStudentListForBasicDetailsChange', {
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
          console.error('Error in getStudentListForBasicDetailsChange:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }


  // onUpdateStudentProfileAddressDetails(data: any, action: string) {
  //   // Combine dataSource with form array values
  //   const formValues = this.addressCorrections.value;

  //   // console.log("formValues :+++++++++ ", formValues);
  //   const payload = data.map((row: any, index: number) => ({
  //     id: this.selectedId,
  //     ue_id: this.selectedStudentUEId,
  //     student_id: this.selectedStudentId,
  //     correction_status: formValues[index].correction_status,
  //     titleid: row.titleid,
  //     action: action,
  //   }));
  //   // console.log("Payload to send:", payload);
  //   this.http.putData('/studentProfile/update/updateStudentProfileAddressDetails', payload, 'academic').subscribe(
  //     (res: any) => {
  //       // console.log("res.body ---> ", res.body);
  //       if (!res.body.error) {
  //         this.alert.alertMessage(res.body?.data?.message || "Address Updated!", ``, "success");
  //         this.getDegreeProgrammeTypeData(); //* Refresh dashboard data
  //         this.studentsListOptions.dataSource = []; //~ Clear student list
  //         this.studentsListOptions.listLength = 0;
  //         this.studentAddressDetailOptions.dataSource = []; //~ Clear student address details
  //         this.studentAddressDetailOptions.listLength = 0;
  //       } else {
  //         this.alert.alertMessage("Something went wrong!", res.body.error?.message || res.body.error, "warning");
  //       }
  //     },
  //     (error) => {
  //       console.error('Error in updateStudentProfileAddressDetails:', error);
  //       this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
  //     });
  // }

  getStudentChangesDetailsData(student: any) {
    // console.log("student ===ddsds>>>> ", student);
    this.selectedStudentUEId = student.ue_id;
    this.selectedId = student.id;
    this.selectedStudentId = student.student_id;
    this.http.getParam('/studentProfile/get/getStudentProfileAddressDetails', {
      student_id: student.student_id,
    }, 'academic')
      .subscribe(
        (result: any) => {
          let studentList = result.body.data;
          console.log("result.body ==dd==> ", studentList);

          // // Reset FormArray
          // this.addressCorrections.clear();

          // // Build form controls for each row
          // studentList.forEach(() => {
          //   this.addressCorrections.push(
          //     this.fb.group({
          //       correction_status: ['1'] // Default: "Correction Required"
          //     })
          //   );
          // });

          const dialogRef = this.dialog.open(StudentBasicDetailsUpdatePopupComponent, {
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

