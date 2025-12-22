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
      this.addressUpdateForm.patchValue(this.getData);
    });

  }
  createAddressForm() {
    this.addressUpdateForm = this.fb.group({
      permanent_address1: [''],
      permanent_address2: [''],
      permanent_address3: [''],
      permanent_country_id: [''],
      permanent_state_id: [''],
      permanent_district_id: [''],
      permanent_pin_code: [''],

      current_address1: [''],
      current_address2: [''],
      current_address3: [''],
      current_country_id: [''],
      current_state_id: [''],
      current_district_id: [''],
      current_pin_code: [''],

      address_proof: ['']
    });
  }


  closeDialog() {
    this.dialogRef.close();
  }

  onUpdateAddress() {
    let temp = this.addressUpdateForm.value
    console.log("temp ==>>>   _> ", temp);
    // if (!mobile_no) {
    //   return this.alert.alertMessage("Mobile Number is Required", "", "warning");
    // }
    // call API to update student mobile no
    // this.http.putData('/studentProfile/update/updateStudentAddressRequest', {
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
}
