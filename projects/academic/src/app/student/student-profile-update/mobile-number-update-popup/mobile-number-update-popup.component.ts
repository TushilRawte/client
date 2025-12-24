import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService, HttpService } from 'shared';

@Component({
  selector: 'app-mobile-number-update-popup',
  standalone: false,
  templateUrl: './mobile-number-update-popup.component.html',
  styleUrl: './mobile-number-update-popup.component.scss'
})
export class MobileNumberUpdatePopupComponent {
  getData: any = {};
  documentList: any;
  mobileNumberUpdateForm!: FormGroup;

  constructor(private http: HttpService,
    public dialogRef: MatDialogRef<MobileNumberUpdatePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private alert: AlertService,
  ) {
    // console.log('Received in Dialog:', data);
    this.getData = data
  }

  ngOnInit(): void {
    this.mobileNumberUpdateForm = this.fb.group({
      mobile: [{ value: this.getData.mobile, disabled: true }],
      mobile_no: ['', Validators.required],
      mobile_no_update: ['Y'],
      ue_id: [this.getData.ue_id],
      // e_mail: [{ value: this.getData.e_mail, disabled: true }],
      // email: [''],
      // email_id_update: [''],
      pdfFile: [''],
      dob: [this.getData.dob]
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onUpdateMobileNumber() {
    let { ue_id, mobile_no, mobile_no_update, pdfFile, dob } = this.mobileNumberUpdateForm.value
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('ue_id', ue_id);
    formData.append('mobile_no_update', mobile_no_update);
    formData.append('mobile_no', mobile_no)
    formData.append('dob', dob)

    if (!mobile_no) {
      return this.alert.alertMessage("Mobile Number is Required", "", "warning");
    }

    if (!pdfFile) {
      return this.alert.alertMessage("Document Proof is Required", "", "warning");
    }
    // call API to update student mobile no
    this.http.postFile('/studentProfile/postFile/updateStudentMobileNumberRequest',
      formData,
      'academic')
      .subscribe(
        (result: any) => {
          // console.log("result.body ===> ", result);
          if (result?.body?.data?.message) {
            this.dialogRef.close();
            this.alert.alertMessage(result.body.data.message || "Mobile Number Updated.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
        },
        (error) => {
          console.error('Error in getStudentList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  get f() {
    return this.mobileNumberUpdateForm.controls;
  }
}
