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
      // mobile_no_update: [''],
      ue_id: [this.getData.ue_id],
      // e_mail: [{ value: this.getData.e_mail, disabled: true }],
      // email: [''],
      // email_id_update: [''],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onUpdateMobileNumber() {
    let { ue_id, mobile_no } = this.mobileNumberUpdateForm.value
    if (!mobile_no) {
      return this.alert.alertMessage("Mobile Number is Required", "", "warning");
    }
    // call API to update student mobile no
    this.http.putData('/studentProfile/update/updateStudentMobileNumber', {
      ue_id: ue_id,
      mobile_no: mobile_no
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result ===> ", result);
          this.dialogRef.close();
          this.alert.alertMessage(result.body?.data?.message || "Mobile Number Updated.", "", "success");
        },
        (error) => {
          console.error('Error in getStudentList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      )
  }
}
