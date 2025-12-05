import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService, HttpService } from 'shared';

@Component({
  selector: 'app-student-basic-details-update-popup',
  standalone: false,
  templateUrl: './student-basic-details-update-popup.component.html',
  styleUrl: './student-basic-details-update-popup.component.scss'
})
export class StudentBasicDetailsUpdatePopupComponent implements OnInit {
  getData: any = [];
  addressChangeDetailsForm!: FormGroup;

  selectedId: string | null = null;
  selectedStudentId: string | null = null;
  selectedStudentUEId: string | null = null;

  constructor(private http: HttpService,
    public dialogRef: MatDialogRef<StudentBasicDetailsUpdatePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private alert: AlertService,
  ) {
    // console.log('Received in Dialog++++++:', data);
    this.getData = data
    this.addressChangeDetailsForm = this.fb.group({
      addressCorrections: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Reset FormArray
    this.addressCorrections.clear();

    // Build form controls for each row
    this.getData.forEach(() => {
      this.addressCorrections.push(
        this.fb.group({
          correction_status: ['1'] // Default: "Correction Required"
        })
      );
    });
    this.studentAddressDetailOptions.dataSource = this.getData;
    this.studentAddressDetailOptions.listLength = this.getData?.length;
  }

  get addressCorrections(): FormArray {
    return this.addressChangeDetailsForm.get('addressCorrections') as FormArray;
  }

  studentAddressDetailOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    // is_filter: true,
    is_filter: false,
    dataSource: [],
    // button: ['print', 'pdf', 'copy', 'excel'],
    button: [],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "Student Details for Correction",
  };

  closeDialog() {
    this.dialogRef.close();
  }

  onUpdateAddress() {
    // if (!mobile_no) {
    //   return this.alert.alertMessage("Mobile Number is Required", "", "warning");
    // }
    // call API to update student mobile no
    // this.http.putData('/studentProfile/update/updateStudentAddress', {
    //   // ue_id: ue_id,
    //   // mobile_no: mobile_no
    // }, 'academic')
    //   .subscribe(
    //     (result: any) => {
    //       // console.log("result ===> ", result);
    //       this.dialogRef.close();
    //       this.alert.alertMessage(result.body?.data?.message || "Address Updated.", "", "success");
    //     },
    //     (error) => {
    //       console.error('Error in updateStudentAddress:', error);
    //       this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
    //     }
    //   )
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

}
