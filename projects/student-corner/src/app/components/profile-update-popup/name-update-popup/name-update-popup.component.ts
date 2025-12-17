import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService, HttpService } from 'shared';

@Component({
  selector: 'app-name-update-popup',
  standalone: false,
  templateUrl: './name-update-popup.component.html',
  styleUrl: './name-update-popup.component.scss'
})
export class NameUpdatePopupComponent implements OnInit {
  getData: any = {};
  documentList: any;
  basicDetailsUpdateForm!: FormGroup;
  countries: any = []
  states: any = []
  districts: any = []
  blocks: any = []

  constructor(private http: HttpService,
    public dialogRef: MatDialogRef<NameUpdatePopupComponent>,
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
      // this.getcountryData(),
      // this.getStateData(),
      // this.getDistrictData()
    ]).then(() => {
      // Convert dob to input[type="date"] format
      const dobFormatted = this.getData.dob
        ? this.getData.dob.split("T")[0]
        : '';
      this.basicDetailsUpdateForm.patchValue({ ...this.getData, dob: dobFormatted });
    });

  }
  createAddressForm() {
    this.basicDetailsUpdateForm = this.fb.group({
      student_first_name_e: [''],
      student_middle_name_e: [''],
      student_last_name_e: [''],
      name_update_yn: [''],

      father_name: [''],
      father_name_update_yn: [''],

      mother_name: [''],
      mother_name_update_yn: [''],

      dob: [''],
      dob_update_yn: [''],

      sex: [''],
      sex_update_yn: [''],

      category_name_e: [''],
      category_name_update_yn: [''],

      pdfFile: ['']
    });
  }


  closeDialog() {
    this.dialogRef.close();
  }

  onUpdateBasicDetails() {
    let { student_first_name_e,
      student_middle_name_e,
      student_last_name_e,
      name_update_yn,

      father_name,
      father_name_update_yn,

      mother_name,
      mother_name_update_yn,

      // dob,
      // dob_update_yn,

      sex,
      sex_update_yn,

      // category_name_e,
      // category_name_update_yn,

      pdfFile
    } = this.basicDetailsUpdateForm.value
    // if (!no value) {
    //   return this.alert.alertMessage("Atleast one feilds are required", "", "warning");
    // }

    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('ue_id', this.getData.ue_id);
    formData.append('student_first_name_e', student_first_name_e);
    formData.append('student_middle_name_e', student_middle_name_e);
    formData.append('student_last_name_e', student_last_name_e);
    formData.append('name_update_yn', name_update_yn);

    formData.append('father_name', father_name);
    formData.append('father_name_update_yn', father_name_update_yn);

    formData.append('mother_name', mother_name);
    formData.append('mother_name_update_yn', mother_name_update_yn);

    // formData.append('dob', dob);
    // formData.append('dob_update_yn', dob_update_yn);

    formData.append('sex', sex);
    formData.append('sex_update_yn', sex_update_yn);


    // formData.append('category_name_e', category_name_e);
    // formData.append('category_name_update_yn', category_name_update_yn);

    // console.log("formData :->--->> ", formData);

    // call API to update student category
    this.http.postFile('/studentProfile/postFile/updateStudentBasicDetailsRequest',
      formData,
      'academic')
      .subscribe(
        (result: any) => {
          // console.log("result.body ===> ", result);
          // this.alert.alertMessage(result.body?.data?.message, "", "success"); // || 'Category Update Done.'
          if (result?.body?.data?.message) {
            this.dialogRef.close();
            this.alert.alertMessage(result.body.data.message || "Basic Details Updated.", "", "success")
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


  // getcountryData() {
  //   return new Promise(resolve => {
  //     this.http.getParam('/master/get/getCountry', {}, 'academic')
  //       .subscribe((result: any) => {
  //         this.countries = result.body.data;
  //         resolve(true);
  //       });
  //   });
  // }

  // getStateData() {
  //   return new Promise(resolve => {
  //     this.http.getParam('/master/get/getState', {}, 'academic')
  //       .subscribe((result: any) => {
  //         this.states = result.body.data;
  //         // console.log("this.states ==> ", this.states);
  //         resolve(true);
  //       });
  //   });
  // }

  // getDistrictData() {
  //   return new Promise(resolve => {
  //     this.http.getParam('/master/get/getDistrict', {}, 'academic')
  //       .subscribe((result: any) => {
  //         this.districts = result.body.data;
  //         resolve(true);
  //       });
  //   });
  // }

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
    return this.basicDetailsUpdateForm.controls;
  }
}
