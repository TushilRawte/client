import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, FileuploadComponent, HttpService, PrintService } from 'shared';
import { environment } from 'environment';

@Component({
  selector: 'app-student-category-change',
  standalone: false,
  templateUrl: './student-category-change.component.html',
  styleUrl: './student-category-change.component.scss'
})
export class StudentCategoryChangeComponent {
 categoryChangeForm!: FormGroup;
  studentDetails: any = null;
  image_prefix: string = environment.filePrefix;

  categoryList: Array<{ category_id: number; category_name: string }> = [
    { category_id: 1, category_name: "OC" },
    { category_id: 2, category_name: "OBC" },
    { category_id: 3, category_name: "SC" },
  ]

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.createForm();
  }

  createForm() {
    this.categoryChangeForm = this.fb.group({
      // student_id: ['', Validators.required],
      student_id: ['', Validators.required],

      category_id: ['', Validators.required],
      reson: ['', Validators.required],
      // action_order_copy: ['', Validators.required],
      pdfFile: ['', Validators.required],
      // faculty: [{ value: '', disabled: true }],
    });
  }

  getStudentDetails_Btn_click(actionType: string) {
    let { student_id, category_id, reson, pdfFile } = this.categoryChangeForm.value;

    if (actionType === 'refresh') {
      this.categoryChangeForm.reset();
      // this.studentDetails = {
      //   student_photo_path: '',
      //   student_signature_path: ''
      // };
      this.studentDetails = null
    }

    if (actionType === 'show') {
      if (!student_id) {
        return this.alert.alertMessage("Student/UE ID is required", "Please insert student/UE ID first", "error");
      }
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
            }
          },
          (error) => {
            console.error('Error in getStudentList:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }

    if (actionType === 'update') {
      console.log("Form Value:", this.categoryChangeForm.value);
      console.log("pdfFile ====>> ", pdfFile);

      if (this.categoryChangeForm.invalid) {
        this.categoryChangeForm.markAllAsTouched();
        return;
      }

      if (!student_id || !category_id || !reson || !pdfFile) {
        return this.alert.alertMessage("All Fields are Required", "Please Fill All Fields Properly", "error");
      }

      // console.log("pdfFile :::-> ", pdfFile);
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('ue_id', student_id);
      formData.append('category_id', category_id);
      formData.append('reson', reson);

      // console.log("formData :->--->> ", formData);

      // call API to update student category
      // this.http.postFile('/studentProfile/postFile/updateStudentCategory',
      this.http.postFile('/studentProfile/postFile/updateStudentCategory',
        formData,
        'academic')
        .subscribe(
          (result: any) => {
            console.log("result.body ===> ", result);
            this.alert.alertMessage(result.body?.data?.message, "", "success"); // || 'Category Update Done.'
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

  get f() {
    return this.categoryChangeForm.controls;
  }



}
