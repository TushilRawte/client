import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-student-password-reset',
  standalone: false,
  templateUrl: './student-password-reset.component.html',
  styleUrl: './student-password-reset.component.scss'
})
export class StudentPasswordResetComponent  implements OnInit {
  passwordResetReportForm!: FormGroup;
  selectedStudentId: string | null = null;
  // new_password: string | null = null;
  new_passwords: { [ue_id: string]: string } = {};

  state = {
    collegeList: [] as any[],
    academicSessionList: [] as any[],
  };

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.passwordResetReportForm = this.fb.group({
      college_id: ['', Validators.required],
      academic_session_id: ['']
    });
  }

  ngOnInit(): void {
    this.getCollegeData();
    this.getAcademicSession();
  }

  studentsListOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "Student List for Password Reset",
  };

  getCollegeData() {
    this.http.getParam('/master/get/getCollege', {}, 'academic')
      .subscribe(
        (result: any) => {
          this.state.collegeList = result.body.data;
        },
        (error) => {
          console.error('Error in collegeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession', {}, 'academic')
      .subscribe(
        (result: any) => {
          this.state.academicSessionList = result.body.data;
        },
        (error) => {
          console.error('Error in academicSessionList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  getReport_Btn_click() {
    if (this.passwordResetReportForm.invalid) {
      this.alert.alertMessage("Validation Error", "Please select both fields", "warning");
      return;
    }

    const formValue = this.passwordResetReportForm.value;
    // console.log('Form Value:', formValue);
    this.http.getParam('/course/get/getStudentList', {
      ...formValue
    }, 'academic')
      .subscribe(
        (result: any) => {
          let data = result?.body?.data || [];

          // ✅ Remove duplicates based on student.ue_id
          const uniqueData = data.filter((student: any, index: number, self: any[]) =>
            index === self.findIndex((s: any) => s.ue_id === student.ue_id)
          );

          // ✅ Sort alphabetically by student_name
          uniqueData.map((stu: any) => ({ ...stu, student_name: stu.student_name?.toUpperCase() }))
            .sort((a: any, b: any) =>
              a.student_name.localeCompare(b.student_name)
            );

          this.studentsListOptions.dataSource = uniqueData;
          this.studentsListOptions.listLength = uniqueData.length;
          // console.log("StudentRegsiteredList:===> ", this.state.StudentRegsiteredList);
        },
        (error) => {
          console.error('Error in StudentRegsiteredList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  async onResetPassword(row: any) {
    // Highlight clicked row
    this.selectedStudentId = row.ue_id;

    const result = await this.alert.confirmAlert(
      "Are you sure you want to reset password?",
      '',
      "question"
    );
    // result.value is true if user confirmed
    if (!result.value) {
      // User clicked "No" or dismissed the modal
      this.selectedStudentId = null;
      return;
    }
    // console.log("row ====>>> ", row);
    this.http.putData('/studentProfile/update/studentPasswordReset', { ue_id: row.ue_id }, 'academic').subscribe(
      (res: any) => {
        // console.log("res.body ---> ", res.body);
        if (!res.body.error) {
          const newPass = res.body?.data?.new_password || null;
          this.new_passwords[row.ue_id] = newPass; // ✅ store only for this student
          this.alert.alertMessage(res.body?.data?.message || "Password Reset Done!", `New Passoword: ${newPass}`, "success");
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message || res.body.error, "warning");
        }
      },
      (error) => {
        console.error('Error in studentPasswordReset:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      }
    );

  }
}
