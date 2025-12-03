import { Component, OnInit } from '@angular/core';
import { AlertService, HttpService, PrintService } from 'shared';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { environment, apiPort } from 'environment';
import { MobileNumberUpdatePopupComponent } from '../profile-update-popup/mobile-number-update-popup/mobile-number-update-popup.component';
import { AddressUpdatePopupComponent } from '../profile-update-popup/address-update-popup/address-update-popup.component';
import { NameUpdatePopupComponent } from '../profile-update-popup/name-update-popup/name-update-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  // profileFormGroup:any 

  //   constructor(private fb: FormBuilder){};

  // finalizeCourseForm() {
  //   this.profileFormGroup = this.fb.group({
  //     academic_session_id: ['', Validators.required],
  //     college_id: ['', Validators.required],
  //     degree_programme_id: ['', Validators.required],
  //     semester_id: ['', Validators.required],
  //   });
  // }

  // constructor(private HTTP: HttpService) { }
  // sessionData: any = {};
  // ngOnInit(): void {
  //   const storedData = sessionStorage.getItem('studentData');
  //   if (storedData) {
  //     const studentData = JSON.parse(storedData);
  //     this.sessionData = studentData
  //     this.getStudentDetails();
  //   }
  // }
  // studentData: any;
  // igkvUrl: string = 'https://igkv.ac.in/'

  // getStudentDetails() {
  //   const params = {
  //     academic_session_id: this.sessionData?.academic_session_id,
  //     course_year_id: this.sessionData?.course_year_id,
  //     semester_id: this.sessionData?.semester_id,
  //     college_id: this.sessionData?.college_id,
  //     degree_programme_id: this.sessionData?.degree_programme_id,
  //     ue_id: this.sessionData?.ue_id
  //   }
  //   this.HTTP.getParam('/course/get/getStudentList/', params, 'academic').subscribe((result: any) => {
  //     console.warn(result.body.data[0])
  //     this.studentData = result.body.data[0];
  //   })
  // }
  student: any = {}
  student_id = 20210572;
  profileFormGroup!: FormGroup;
  file_prefix: string = environment.filePrefix;
  countries: any = []
  states: any = []
  districts: any = []
  blocks: any = []

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    Promise.all([
      this.getcountryData(),
      this.getStateData(),
      this.getDistrictData()
    ]).then(() => {
      this.getStudentProfileData();  // Run this AFTER dropdowns loaded
    });
  }

  createForm() {
    this.profileFormGroup = this.fb.group({
      student_name: [{ value: '', disabled: true }],
      father_name: [{ value: '', disabled: true }],
      mother_name: [{ value: '', disabled: true }],
      dob: [{ value: '', disabled: true }],
      sex: [{ value: '', disabled: true }],
      category_name_e: [{ value: '', disabled: true }],

      // Admission Details
      counseling_adm_id: [{ value: '', disabled: true }],
      entrance_exam_type_name: [{ value: '', disabled: true }],
      admsn_quota_type: [{ value: '', disabled: true }],
      faculty_name: [{ value: '', disabled: true }],
      degree_programme_name_e: [{ value: '', disabled: true }],
      subject_name: [{ value: '', disabled: true }],
      admitted_category: [{ value: '', disabled: true }],
      college_name_e: [{ value: '', disabled: true }],

      // Academic Details
      student_id: [{ value: '', disabled: true }],
      university_id: [{ value: '', disabled: true }],
      course_year_name: [{ value: '', disabled: true }],
      semester_name: [{ value: '', disabled: true }],
      academic_status_name: [{ value: '', disabled: true }],
      student_status_name: [{ value: '', disabled: true }],

      // Contact
      e_mail: [{ value: '', disabled: true }],
      mobile: [{ value: '', disabled: true }],

      // Permanent Address
      permanent_country_id: [{ value: '', disabled: true }],
      permanent_state_id: [{ value: '', disabled: true }],
      permanent_district_id: [{ value: '', disabled: true }],
      permanent_pin_code: [{ value: '', disabled: true }],
      permanent_address: [{ value: '', disabled: true }],

      // Current Address
      current_country_id: [{ value: '', disabled: true }],
      current_state_id: [{ value: '', disabled: true }],
      current_district_id: [{ value: '', disabled: true }],
      current_pin_code: [{ value: '', disabled: true }],
      current_address: [{ value: '', disabled: true }],
    });
  }

  getStudentProfileData() {
    this.http.getParam(
      '/studentProfile/get/getStudentProfile',
      { student_id: this.student_id },
      'academic'
    )
      .subscribe(
        (result: any) => {
          this.student = result.body.data;
          // console.log("getStudentProfile : ", this.student);

          // Convert dob to input[type="date"] format
          const dobFormatted = this.student.dob
            ? this.student.dob.split("T")[0]
            : '';

          this.profileFormGroup.patchValue({
            student_name: this.student.student_name,
            father_name: this.student.father_name,
            mother_name: this.student.mother_name,
            dob: dobFormatted,
            sex: this.student.sex,
            category_name_e: this.student.category_name_e,

            // Admission
            counseling_adm_id: this.student.counseling_adm_id,
            entrance_exam_type_name: this.student.entrance_exam_type_name,
            admsn_quota_type: this.student.admsn_quota_type,
            faculty_name: this.student.faculty_name,
            degree_programme_name_e: this.student.degree_programme_name_e,
            subject_name: this.student.subject_name,
            admitted_category: this.student.admitted_category || this.student.verified_category,
            college_name_e: this.student.college_name_e,

            // Academic
            student_id: this.student.student_id,
            university_id: this.student.university_id,
            course_year_name: this.student.course_year_name,
            semester_name: this.student.semester_name,
            academic_status_name: this.student.academic_status_name,
            student_status_name: this.student.student_status_name,

            // Contact
            e_mail: this.student.e_mail,
            mobile: this.student.mobile,

            // Permanent Address
            permanent_country_id: this.student.permanent_country_id,
            permanent_state_id: this.student.permanent_state_id,
            permanent_district_id: this.student.permanent_district_id,
            permanent_pin_code: this.student.permanent_pin_code,
            permanent_address: (this.student.permanent_address1 + this.student.permanent_address2 + this.student.permanent_address3).toUpperCase(),

            // Current Address
            current_country_id: this.student.current_country_id,
            current_state_id: this.student.current_state_id,
            current_district_id: this.student.current_district_id,
            current_pin_code: this.student.current_pin_code,
            current_address: (this.student.current_address1 + this.student.current_address2 + this.student.current_address3).toUpperCase(),
          });
        },
        (error) => {
          console.error('Error in getStudentProfile:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }


  getcountryData() {
    return new Promise(resolve => {
      this.http.getParam('/master/get/getCountry', {}, 'academic')
        .subscribe((result: any) => {
          this.countries = result.body.data;
          resolve(true);
        });
    });
  }

  getStateData() {
    return new Promise(resolve => {
      this.http.getParam('/master/get/getState', {}, 'academic')
        .subscribe((result: any) => {
          this.states = result.body.data;
          // console.log("this.states ==> ", this.states);
          resolve(true);
        });
    });
  }

  getDistrictData() {
    return new Promise(resolve => {
      this.http.getParam('/master/get/getDistrict', {}, 'academic')
        .subscribe((result: any) => {
          this.districts = result.body.data;
          resolve(true);
        });
    });
  }

  onMobileNumberUpdate() {
    let { university_id, mobile, e_mail } = this.profileFormGroup.value
    const dialogRef = this.dialog.open(MobileNumberUpdatePopupComponent, {
      width: '400px',
      height: '300px', // 600 for email
      data: { mobile, ue_id: university_id, e_mail }, // ✅ pass the entire row here
      // disableClose: true, // optional
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with result:', result);
      }
    });
  }

  onAddressUpdate() {
    const dialogRef = this.dialog.open(AddressUpdatePopupComponent, {
      width: '800px',
      height: '670px',
      data: this.student,
      // disableClose: true, // optional
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with result:', result);
      }
    });
  }

  onNameUpdate() {
    const dialogRef = this.dialog.open(NameUpdatePopupComponent, {
      width: '800px',
      height: '550px',
      data: this.student,
      // disableClose: true, // optional
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with result:', result);
      }
    });
  }


}




