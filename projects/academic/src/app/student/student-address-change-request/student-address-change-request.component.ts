import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-student-address-change-request',
  standalone: false,
  templateUrl: './student-address-change-request.component.html',
  styleUrl: './student-address-change-request.component.scss'
})
export class StudentAddressChangeRequestComponent  implements OnInit {
  addressChangeDetailsForm!: FormGroup;
  actionType: string | null = null;
  selectedId: string | null = null;
  selectedStudentId: string | null = null;
  selectedStudentUEId: string | null = null;
  selected: { [ue_id: string]: string } = {};
  selectedRowId: number | null = null;
  @ViewChild('addressDetailsBlock') addressDetailsBlock!: ElementRef;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.addressChangeDetailsForm = this.fb.group({
      addressCorrections: this.fb.array([])
    });
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
    title: "Total Request For Address Correction",
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
    title: "List of Student Requiered Correction",
  };

  studentAddressDetailOptions: any = {
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
    title: "Student Details for Correction",
  };

  get addressCorrections(): FormArray {
    return this.addressChangeDetailsForm.get('addressCorrections') as FormArray;
  }

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

  getStudentProfileAddressDetailsData(student: any) {
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
          this.studentAddressDetailOptions.dataSource = studentList;
          this.studentAddressDetailOptions.listLength = studentList?.length;

          // Reset FormArray
          this.addressCorrections.clear();

          // Build form controls for each row
          studentList.forEach(() => {
            this.addressCorrections.push(
              this.fb.group({
                correction_status: ['1'] // Default: "Correction Required"
              })
            );
          });

          // 👉 Smooth scroll after updating data
          this.scrollToAddressDetails();
        },
        (error) => {
          console.error('Error in getStudentListForAddressChange:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  toCapitalEachWord(str: string = ""): string {
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  onUpdateStudentProfileAddressDetails(data: any, action: string) {
    // Combine dataSource with form array values
    const formValues = this.addressCorrections.value;

    // console.log("formValues :+++++++++ ", formValues);
    const payload = data.map((row: any, index: number) => ({
      id: this.selectedId,
      ue_id: this.selectedStudentUEId,
      student_id: this.selectedStudentId,
      correction_status: formValues[index].correction_status,
      titleid: row.titleid,
      action: action,
    }));
    // console.log("Payload to send:", payload);
    this.http.putData('/studentProfile/update/updateStudentProfileAddressDetails', payload, 'academic').subscribe(
      (res: any) => {
        // console.log("res.body ---> ", res.body);
        if (!res.body.error) {
          this.alert.alertMessage(res.body?.data?.message || "Address Updated!", ``, "success");
          this.getDegreeProgrammeTypeData(); //* Refresh dashboard data
          this.studentsListOptions.dataSource = []; //~ Clear student list
          this.studentsListOptions.listLength = 0;
          this.studentAddressDetailOptions.dataSource = []; //~ Clear student address details
          this.studentAddressDetailOptions.listLength = 0;
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message || res.body.error, "warning");
        }
      },
      (error) => {
        console.error('Error in updateStudentProfileAddressDetails:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      });
  }

  scrollToAddressDetails() {
    setTimeout(() => {
      if (this.addressDetailsBlock) {
        this.addressDetailsBlock.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 200); // small delay to ensure DOM is rendered
  }


}

