import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService, HttpService } from 'shared';

@Component({
  selector: 'app-address-update-popup',
  standalone: false,
  templateUrl: './address-update-popup.component.html',
  styleUrl: './address-update-popup.component.scss'
})
export class AddressUpdatePopupComponent implements OnInit {
  getData: any = {};
  documentList: any;
  addressUpdateForm!: FormGroup;
  countries: any = []
  states: any = []
  districts: any = []
  blocks: any = []

  constructor(private http: HttpService,
    public dialogRef: MatDialogRef<AddressUpdatePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private alert: AlertService,
  ) {
    // console.log('Received in Dialog:', data);
    this.getData = data
  }

  ngOnInit(): void {
    this.createAddressForm();   // initialize form FIRST
    Promise.all([
      this.getcountryData(),
      this.getStateData(),
      this.getDistrictData()
    ]).then(() => {
      // this.addressUpdateForm = this.fb.group({
      //   ue_id: [this.getData.ue_id],

      //   // Permanent Address
      //   permanent_country_id: [this.getData.permanent_country_id],
      //   permanent_state_id: [this.getData.permanent_state_id],
      //   permanent_district_id: [this.getData.permanent_district_id],
      //   permanent_pin_code: [this.getData.permanent_pin_code],
      //   permanent_address1: [this.getData.permanent_address1],
      //   permanent_address2: [this.getData.permanent_address2],
      //   permanent_address3: [this.getData.permanent_address3],


      //   // Current Address
      //   current_country_id: [this.getData.current_country_id],
      //   current_state_id: [this.getData.current_state_id],
      //   current_district_id: [this.getData.current_district_id],
      //   current_pin_code: [this.getData.current_pin_code],
      //   current_address1: [this.getData.current_address1],
      //   current_address2: [this.getData.current_address2],
      //   current_address3: [this.getData.current_address3],


      //   address_proof: ['', Validators.required]
      // });
      console.log("this.getData ===????.>", this.getData);
      this.addressUpdateForm.patchValue(this.getData);
    });

  }
  createAddressForm() {
    this.addressUpdateForm = this.fb.group({
      counseling_adm_id: ['', Validators.required],
      ue_id: ['', Validators.required],
      student_id: ['', Validators.required],
      admission_session: ['', Validators.required],
      college_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],

      permanent_address1: ['', Validators.required],
      permanent_address2: [''],
      permanent_address3: [''],
      permanent_country_id: ['', Validators.required],
      permanent_state_id: ['', Validators.required],
      permanent_district_id: ['', Validators.required],
      permanent_pin_code: ['', Validators.required],

      current_address1: ['', Validators.required],
      current_address2: [''],
      current_address3: [''],
      current_country_id: ['', Validators.required],
      current_state_id: ['', Validators.required],
      current_district_id: ['', Validators.required],
      current_pin_code: ['', Validators.required],

      address_proof: ['', Validators.required]
    });
  }


  closeDialog() {
    this.dialogRef.close();
  }

  onUpdateAddress() {
    let {
      counseling_adm_id,
      ue_id,
      student_id,
      admission_session,
      college_id,
      degree_programme_id,
      address_proof,
      current_address1,
      current_address2,
      current_address3,
      current_country_id,
      current_district_id,
      current_pin_code,
      current_state_id,
      permanent_address1,
      permanent_address2,
      permanent_address3,
      permanent_country_id,
      permanent_district_id,
      permanent_pin_code,
      permanent_state_id
    } = this.addressUpdateForm.value
    const formData = new FormData();
    formData.append('ue_id', ue_id);
    formData.append('admission_id', counseling_adm_id);
    formData.append('student_id', student_id);
    formData.append('admission_session', admission_session);
    formData.append('college_id', college_id);
    formData.append('degree_programme_id', degree_programme_id);

    formData.append('address_proof', address_proof);

    formData.append('current_address1', current_address1);
    formData.append('current_address2', current_address2);
    formData.append('current_address3', current_address3);
    formData.append('current_country_id', current_country_id);
    formData.append('current_district_id', current_district_id);
    formData.append('current_pin_code', current_pin_code);
    formData.append('current_state_id', current_state_id);

    formData.append('permanent_address1', permanent_address1);
    formData.append('permanent_address2', permanent_address2);
    formData.append('permanent_address3', permanent_address3);
    formData.append('permanent_country_id', permanent_country_id);
    formData.append('permanent_district_id', permanent_district_id);
    formData.append('permanent_pin_code', permanent_pin_code);
    formData.append('permanent_state_id', permanent_state_id);

    // if (!mobile_no) {
    //   return this.alert.alertMessage("Mobile Number is Required", "", "warning");
    // }

    // if (!pdfFile) {
    //   return this.alert.alertMessage("Document Proof is Required", "", "warning");
    // }
    // if (!mobile_no) {
    //   return this.alert.alertMessage("Mobile Number is Required", "", "warning");
    // }
    // call API to update student mobile no
    this.http.postFile('/studentProfile/postFile/updateStudentAddressRequest', formData, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("result ===> ", result);
          if (result?.body?.data?.message) {
            this.dialogRef.close();
            this.alert.alertMessage(result.body.data.message || "Address Change Request Sended.", "Wait For Approval", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
        },
        (error) => {
          console.error('Error in updateStudentAddress:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      )
  }


  getcountryData() {
    return new Promise(resolve => {
      // this.http.getParam('/master/get/getCountry', {}, 'academic')
      this.http.getParam('/master/get/getCountryList', {}, 'recruitement')
        .subscribe((result: any) => {
          this.countries = result.body.data;
          resolve(true);
        });
    });
  }

  getStateData() {
    return new Promise(resolve => {
      // this.http.getParam('/master/get/getState', {}, 'academic')
      this.http.getParam('/master/get/getStateList', {}, 'recruitement')
        .subscribe((result: any) => {
          this.states = result.body.data;
          // console.log("this.states ==> ", this.states);
          resolve(true);
        });
    });
  }

  getDistrictData() {
    return new Promise(resolve => {
      // this.http.getParam('/master/get/getDistrict', {}, 'academic')
      this.http.getParam('/master/get/getDistrictsByState', {}, 'recruitement')
        .subscribe((result: any) => {
          this.districts = result.body.data;
          resolve(true);
        });
    });
  }

  // getBlockData() {
  //   this.http.getParam('/master/get/getBlock',
  //     {},
  //     'academic')
  //     .subscribe(
  //       (result: any) => {
  //         // console.log("collegeList : ", result);
  //         this.blocks = result.body.data;
  //       },
  //       (error) => {
  //         console.error('Error in collegeList:', error);
  //         this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
  //       });
  // };

  get f() {
    return this.addressUpdateForm.controls;
  }
}
