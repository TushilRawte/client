import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
@Component({
  selector: 'app-student-mobile-number-update',
  standalone: false,
  templateUrl: './student-mobile-number-update.component.html',
  styleUrl: './student-mobile-number-update.component.scss'
})
export class StudentMobileNumberUpdateComponent {
 mobileNoChangeForm!: FormGroup;
  studentDetails: any = null;
  image_prefix: string = 'https://igkv.ac.in/';

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.createForm();
  }

  createForm() {
    this.mobileNoChangeForm = this.fb.group({
      // Student Details
      student_id: ['', Validators.required],
      student_name: [{ value: '', disabled: true }],

      // Admission Details
      transcript_generated: [{ value: 'no', disabled: true }],
      pdc_generated: [{ value: 'no', disabled: true }],
      admission_id: [{ value: '', disabled: true }],
      session: [{ value: '', disabled: true }],
      dob: [{ value: '', disabled: true }],
      gender: [{ value: 'O', disabled: true }],

      // Faculty / College / Programme
      faculty: [{ value: '', disabled: true }],
      college: [{ value: '', disabled: true }],
      degree_programme: [{ value: '', disabled: true }],

      // Academic Details
      year: [{ value: '', disabled: true }],
      sem: [{ value: '', disabled: true }],
      admission_type: [{ value: '', disabled: true }],

      // Mobile Number
      mobile_no: ['']
    });
  }

  getStudentDetails_Btn_click(actionType: string) {
    // console.log("Form Value:", this.mobileNoChangeForm.value);

    let { student_id, mobile_no } = this.mobileNoChangeForm.value;

    if (actionType === 'refresh') {
      this.mobileNoChangeForm.reset();
      this.studentDetails = {
        student_photo_path: '',
        student_signature_path: ''
      };
    }

    if (actionType === 'show') {
      // call API to get data
      this.http.getParam('/course/get/getStudentList', {
        ue_id: student_id
      }, 'academic')
        .subscribe(
          (result: any) => {
            if (result?.body?.data.length === 0) {
              this.alert.alertMessage("Invalid User", "No Records Found in Databse", "error");
            } else {
              let data = result?.body?.data?.pop() || [];
              this.studentDetails = data;
              this.mobileNoChangeForm.patchValue({
                student_id: data.ue_id,
                student_name: data.student_name,
                transcript_generated: data.transcript_gen_yn,
                pdc_generated: data.pdc_gen_yn,
                admission_id: data.registration_id,
                session: data.academic_session_name_e,
                dob: this.formatDOB(data.dob),
                gender: data.gender_id,
                faculty: data.faculty_name_e,
                college: data.college_name_e,
                degree_programme: data.degree_programme_name_e,
                year: data.course_year_name_e,
                sem: data.semester_name_e,
                admission_type: data.stu_acad_status_name_e,
                mobile_no: data.mobile_no
              });
            }
          },
          (error) => {
            console.error('Error in getStudentList:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }

    if (actionType === 'update') {
      // call API to update student mobile no
      this.http.putData('/studentProfile/update/updateStudentMobileNumber', {
        ue_id: student_id,
        mobile_no: mobile_no
      }, 'academic')
        .subscribe(
          (result: any) => {
            // console.log("result ===> ", result);
            this.alert.alertMessage(result.body?.data?.message || "Mobile Number Updated.", "", "success");
          },
          (error) => {
            console.error('Error in getStudentList:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }

  formatDOB(dateString: string): string {
    if (!dateString) return '';

    const d = new Date(dateString);

    if (isNaN(d.getTime())) return dateString; // fallback

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear(); // full 4-digit year

    return `${day}-${month}-${year}`;
  }



}
