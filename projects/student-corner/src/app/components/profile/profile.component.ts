import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
import { environment, apiPort } from 'environment';
import { MatDialog } from '@angular/material/dialog';
import { MobileNumberUpdatePopupComponent } from '../profile-update-popup/mobile-number-update-popup/mobile-number-update-popup.component';
import { AddressUpdatePopupComponent } from '../profile-update-popup/address-update-popup/address-update-popup.component';
import { NameUpdatePopupComponent } from '../profile-update-popup/name-update-popup/name-update-popup.component';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @ViewChild('profileInput') profileInput!: ElementRef;
  @ViewChild('signatureInput') signatureInput!: ElementRef;

  profileFormGroup!: FormGroup;
  file_prefix: string = environment.filePrefix;
  countries: any = []
  student: any = {}
  states: any = []
  districts: any = []
  student_id = 20242185;

  // New properties for image upload
  profileImageFile: File | null = null;
  signatureImageFile: File | null = null;
  profileImagePreview: string = '';
  signatureImagePreview: string = '';
  isProfileUploading: boolean = false;
  isSignatureUploading: boolean = false;

  // Validation limits (in KB - file size)
  readonly PROFILE_MIN_SIZE_KB = 20;
  readonly PROFILE_MAX_SIZE_KB = 100;
  readonly SIGNATURE_MIN_SIZE_KB = 10;
  readonly SIGNATURE_MAX_SIZE_KB = 50;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
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
      this.getStudentProfileData();
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
      ue_id: [{ value: '', disabled: true }],
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

  // Method to trigger profile image upload
  triggerProfileUpload(): void {
    this.profileInput.nativeElement.click();
  }

  // Method to trigger signature upload
  triggerSignatureUpload(): void {
    this.signatureInput.nativeElement.click();
  }

  // Handle profile image selection
  onProfileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateImage(file, 'profile');
    }
    // Reset input value to allow same file selection again
    event.target.value = '';
  }

  // Handle signature image selection
  onSignatureSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateImage(file, 'signature');
    }
    // Reset input value to allow same file selection again
    event.target.value = '';
  }

  // Validate image file size in KB and show preview (NO AUTO UPLOAD)
  validateImage(file: File, type: 'profile' | 'signature'): void {
    const fileSizeKB = file.size / 1024; // Convert bytes to KB
    const fileSizeKBFormatted = fileSizeKB.toFixed(2);

    // console.log(`${type} File Details:`, {
    //   name: file.name,
    //   sizeBytes: file.size,
    //   sizeKB: fileSizeKBFormatted
    // });

    // Check file type (allow only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.alert.alertMessage(
        "Invalid File Type",
        `Please select a valid image file (JPEG, PNG). Selected: ${file.type}`,
        "error"
      );
      return;
    }

    if (type === 'profile') {
      // Profile validation by file size in KB
      if (fileSizeKB < this.PROFILE_MIN_SIZE_KB) {
        this.alert.alertMessage(
          "File Too Small",
          `Profile image must be at least ${this.PROFILE_MIN_SIZE_KB} KB. Current: ${fileSizeKBFormatted} KB.`,
          "error"
        );
        return;
      }

      if (fileSizeKB > this.PROFILE_MAX_SIZE_KB) {
        this.alert.alertMessage(
          "File Too Large",
          `Profile image must be at most ${this.PROFILE_MAX_SIZE_KB} KB. Current: ${fileSizeKBFormatted} KB.`,
          "error"
        );
        return;
      }

      this.profileImageFile = file;
      this.createImagePreview(file, 'profile');
    }
    else if (type === 'signature') {
      // Signature validation by file size in KB
      if (fileSizeKB < this.SIGNATURE_MIN_SIZE_KB) {
        this.alert.alertMessage(
          "File Too Small",
          `Signature image must be at least ${this.SIGNATURE_MIN_SIZE_KB} KB. Current: ${fileSizeKBFormatted} KB.`,
          "error"
        );
        return;
      }

      if (fileSizeKB > this.SIGNATURE_MAX_SIZE_KB) {
        this.alert.alertMessage(
          "File Too Large",
          `Signature image must be at most ${this.SIGNATURE_MAX_SIZE_KB} KB. Current: ${fileSizeKBFormatted} KB.`,
          "error"
        );
        return;
      }

      this.signatureImageFile = file;
      this.createImagePreview(file, 'signature');
    }
  }

  // Create image preview
  createImagePreview(file: File, type: 'profile' | 'signature'): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      if (type === 'profile') {
        this.profileImagePreview = e.target.result;
      } else {
        this.signatureImagePreview = e.target.result;
      }
    };

    reader.onerror = () => {
      this.alert.alertMessage(
        "Preview Error",
        "Failed to load image preview.",
        "error"
      );
    };

    reader.readAsDataURL(file);
  }

  // Upload profile image (called only when Upload button is clicked)
  uploadProfileImage(): void {
    if (!this.profileImageFile) {
      this.alert.alertMessage(
        "No File Selected",
        "Please select a profile image first.",
        "error"
      );
      return;
    }

    this.isProfileUploading = true;
    this.uploadImage(this.profileImageFile, 'profile');
  }

  // Upload signature image (called only when Upload button is clicked)
  uploadSignatureImage(): void {
    if (!this.signatureImageFile) {
      this.alert.alertMessage(
        "No File Selected",
        "Please select a signature image first.",
        "error"
      );
      return;
    }

    this.isSignatureUploading = true;
    this.uploadImage(this.signatureImageFile, 'signature');
  }

  // Upload image to server
  uploadImage(file: File, type: 'profile' | 'signature'): void {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('student_id', this.student_id.toString());
    formData.append('image_type', type);

    // Determine API endpoint based on image type
    // const endpoint = type === 'profile' 
    //   ? '/studentProfile/upload/profileImage' 
    //   : '/studentProfile/upload/signatureImage';

    this.http.postFile("/studentProfile/postFile/updateStudentProfileSignPhoto", formData, 'academic').subscribe(
      (result: any) => {
        if (result?.body?.data?.message) {
          this.alert.alertMessage(
            result.body.data.message,
            '',
            "success"
          );
        } else if (result?.body?.error?.message) {
          this.alert.alertMessage(
            result?.body?.error?.message,
            `${result?.body?.error?.message?.details || ''}`,
            "error"
          );
        } else if (result?.body?.error) {
          this.alert.alertMessage(
            result?.body?.error,
            `${result?.body?.error?.details || ''}`,
            "error"
          );
        }

        // Update student data with new image path
        if (type === 'profile') {
          this.student.student_photo_path = result?.body?.data?.image_path || this.student.student_photo_path;
          this.isProfileUploading = false;

          // Reset after successful upload
          this.profileImagePreview = '';
          this.profileImageFile = null;
        } else {
          this.student.student_signature_path = result?.body?.data?.image_path || this.student.student_signature_path;
          this.isSignatureUploading = false;

          // Reset after successful upload
          this.signatureImagePreview = '';
          this.signatureImageFile = null;
        }
      },
      (error) => {
        console.error('Error uploading image:', error);
        this.alert.alertMessage(
          "Upload Failed",
          "Failed to upload image. Please try again.",
          "error"
        );

        if (type === 'profile') {
          this.isProfileUploading = false;
        } else {
          this.isSignatureUploading = false;
        }
      }
    );
  }

  // Cancel profile upload
  cancelProfileUpload(): void {
    this.profileImagePreview = '';
    this.profileImageFile = null;
    this.isProfileUploading = false;
  }

  // Cancel signature upload
  cancelSignatureUpload(): void {
    this.signatureImagePreview = '';
    this.signatureImageFile = null;
    this.isSignatureUploading = false;
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStudentProfileData() {
    this.http.getParam(
      '/studentProfile/get/getStudentProfile',
      { student_id: this.student_id },
      'academic'
    )
      .subscribe(
        (result: any) => {
          this.student = result.body.data?.[0];
          // console.log("getStudentProfile : ", this.student);

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
            ue_id: this.student.ue_id,
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
            permanent_address: (this.student.permanent_address1 + this.student.permanent_address2 + this.student.permanent_address3)?.toString()?.toUpperCase(),

            // Current Address
            current_country_id: this.student.current_country_id,
            current_state_id: this.student.current_state_id,
            current_district_id: this.student.current_district_id,
            current_pin_code: this.student.current_pin_code,
            current_address: (this.student.current_address1 + this.student.current_address2 + this.student.current_address3)?.toString()?.toUpperCase(),
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
      this.http.getParam('/master/get/getCountryList', {}, 'recruitement')
        .subscribe((result: any) => {
          this.countries = result.body.data;
          resolve(true);
        });
    });
  }

  getStateData() {
    return new Promise(resolve => {
      this.http.getParam('/master/get/getStateList', {}, 'recruitement')
        .subscribe((result: any) => {
          this.states = result.body.data;
          resolve(true);
        });
    });
  }

  getDistrictData() {
    return new Promise(resolve => {
      this.http.getParam('/master/get/getDistrictsByState', {}, 'recruitement')
        .subscribe((result: any) => {
          this.districts = result.body.data;
          resolve(true);
        });
    });
  }

  onMobileNumberUpdate() {
    let { ue_id, mobile, e_mail, dob } = this.profileFormGroup.value
    const dialogRef = this.dialog.open(MobileNumberUpdatePopupComponent, {
      width: '400px',
      height: '400px',
      data: { mobile, ue_id: ue_id, e_mail, dob },
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
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with result:', result);
      }
    });
  }
}