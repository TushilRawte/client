import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
import { MatDialog } from '@angular/material/dialog';
import { CheckDocumentForUidnComponent } from '../check-document-for-uidn/check-document-for-uidn.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-approve-uidn',
  standalone: false,
  templateUrl: './approve-uidn.component.html',
  styleUrl: './approve-uidn.component.scss'
})
export class ApproveUidnComponent {

  generateUIDNFormGroup!: FormGroup
  acadmcSesnList: any;
  collegeList: any;
  degreeList: any;
  studentList: any;
  selectedDegree: any;
  selectAll = false;

  constructor(private fb: FormBuilder, private HTTP: HttpService, private alert: AlertService, private dialog: MatDialog) { }

  ngOnInit() {
    this.generateUIDN();
    this.getCollegeData();
    this.getAcademicSession();
  }

  generateUIDN() {
    this.generateUIDNFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      college_id: ['', Validators.required],
      degree_id: ['', Validators.required],

      students: this.fb.array([])   // <– FormArray like previous code
    });
  }

  get students(): FormArray {
    return this.generateUIDNFormGroup.get('students') as FormArray;
  }


  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession/', {}, 'academic').subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data;
    });
  }

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList/', {}, 'academic').subscribe((result: any) => {
      // console.log(result);
      this.collegeList = result.body.data;
    })
  }

  onCollegeChange(college_id: number) {
    this.getDegree(college_id);
    // this.courseYearList = [];
  }

  getDegree(college_id: number) {
    this.HTTP.getParam('/master/get/getDegreeByDegPrgTyp/', { college_id }, 'academic')
      .subscribe((result: any) => {
        this.degreeList = result.body.data;
        // console.log('Initial Degree Programme:', this.degree);

        // Add hardcoded objects only if college_id = 5
        // if (college_id === 5) {
        //   const extraProgrammes = [
        //     {
        //       degree_programme_id: 14,
        //       degree_programme_name_e: "M.Sc.(Ag.) (PGS)",
        //       degree_id: 12,
        //       subject_id: 139
        //     },
        //     {
        //       degree_programme_id: 37,
        //       degree_programme_name_e: "Ph.D in Agriculture (PGS)",
        //       degree_id: 5,
        //       subject_id: 139
        //     }
        //   ];

        //   // Push into array
        //   this.degreeProgramme.push(...extraProgrammes);
        // }
      });
  }

  onDegreeChange(degree_id: number) {
    // const selected = this.degreeProgramme.find((p: { degree_programme_id: number; }) => p.degree_programme_id === degree_programme_id);
    // const degree_id = selected?.degree_id;
    // const subject_id = selected?.subject_id;
    // const degree_programme_type_id = selected?.degree_programme_type_id;
    // console.log('degree_id to send:', degree_id);
    this.selectedDegree = degree_id
  }

  // ! qlMessage: "Table 'igkv_admission.a_stu_couns_seat_allotment_old' doesn't exist",
  getStudentList() {
    const formData = this.generateUIDNFormGroup.value;
    console.log('Form Data to Submit:', formData);
    const payload = {
      admission_session: formData.academic_session_id,
      college_id: formData.college_id,
      degree_programme_id: this.selectedDegree,
    };
    if (
      !payload.admission_session ||
      !payload.college_id ||
      !payload.degree_programme_id
    ) {
      alert('⚠️ All fields are required!');
      return; // Stop execution
    }
    this.HTTP.getParam('/studentProfile/get/getStudentListForApproveUIDN/', payload, 'academic').subscribe((result: any) => {
      this.studentList = result?.body?.data;
      console.log('Fetched Student List:', this.studentList);

      this.students.clear();

      this.studentList.forEach((row: any) => {
        this.students.push(this.createStudentRow(row, formData));
      });

      console.log('API Response:', result);
    });
  }

  getUploadedDocument(row: any) {
    const dialogRef = this.dialog.open(CheckDocumentForUidnComponent, {
      width: '800px',
      height: '600px',
      data: row, // ✅ pass the entire row here
      // disableClose: true, // optional
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with result:', result);
      }
    });
  }

  createStudentRow(row: any, main: any): FormGroup {
    return this.fb.group({
      selected: [false],

      uidn: [row.uidn],
      entrance_exam_type_code: [row.entrance_exam_type_code],
      student_name: [row.student_name],
      Subject_Name_E: [row.Subject_Name_E],
      admission_id: [row.admission_id],
      academic_session_id: [main.academic_session_id],
      college_id: [main.college_id],
      Counseling_Record_ID: [row.Counseling_Record_ID],
      degree_id: this.selectedDegree
    });
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.students.controls.forEach(ctrl => {
      ctrl.get('selected')?.setValue(checked);
    });
  }

  onRowCheckboxChange() {
    const allSelected = this.students.controls.every(c => c.get('selected')?.value);
    this.selectAll = allSelected;
  }

  // submitSelected() {
  //   const selectedRows = this.students.value.filter((r: any) => r.selected);

  //   if (selectedRows.length === 0) {
  //     alert("⚠️ No student selected!");
  //     return;
  //   }

  //   console.log("Submit Payload:", selectedRows);
  //      this.HTTP.postData('/studentProfile/post/saveGenerateUIDN', selectedRows, 'academic').subscribe(res => {
  //     if (!res.body.error){
  //             this.alert.alertMessage("Record Inserted!", "", "success");
  //     }
  //     else
  //       this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
  //   });
  //   // API call here…
  // }

  submitSelected() {
    const selectedRows = this.students.value.filter((r: any) => r.selected);
    const { academic_session_id, college_id } = this.generateUIDNFormGroup.value;

    if (selectedRows.length === 0) {
      alert("⚠️ No student selected!");
      return;
    }
    console.log("Submit Payload:", selectedRows);
    const selectedAcademicSession = this.acadmcSesnList.find((ac: any) => ac.academic_session_id === academic_session_id);
    const selectedCollege = this.collegeList.find((college: any) => college.college_id === college_id);
    const selectedDegree = this.degreeList.find((degree: any) => degree.degree_id === this.selectedDegree);

    this.HTTP.postData('/studentProfile/post/saveApproveUIDN', {
      selectedRows,
      academic_session_id,
      academic_session_name_e: selectedAcademicSession?.academic_session_name_e,
      college_id,
      college_name_e: selectedCollege?.college_name_e,
      degree_id: this.selectedDegree,
      degree_name_e: selectedDegree?.degree_name_e,
    }, 'academic')
      .subscribe(res => {
        const api = res.body.error;  // this contains { error, message, result }
        if (api && api.error === false) {
          // SUCCESS
          this.alert.alertMessage(
            "Success!",
            api.message || "Record Inserted Successfully!",
            "success"
          );
        } else {
          // FAILURE
          this.alert.alertMessage(
            "Something went wrong!",
            api?.message || "Unknown error",
            "warning"
          );
        }
      });
  }

  getPdf(): void {
    let { academic_session_id, college_id, degree_id } = this.generateUIDNFormGroup.value;
    const selectedAcademicSession = this.acadmcSesnList.find(
      (s: any) => s.academic_session_id === academic_session_id
    );
    const selectedCollege = this.collegeList.find(
      (c: any) => c.college_id === college_id
    );
    // let selectedDegreePro = this.degreeProgramme.filter((degreePro: any) => degreePro.degree_programme_id === degree_id);


    // console.log("this.options?.orientation : ", this.options?.orientation);
    // const html = this.print_content.nativeElement.innerHTML;
    const html = document.getElementById('print-section')?.innerHTML;

    this.HTTP.postBlob(`/file/post/htmltoPdf`, {
      html,
      title: `UIDN Not Finalize Report ${selectedAcademicSession?.academic_session_name_e}`,
      // academic_session_name_e: selectedAcademicSession?.academic_session_name_e,
      college_name_e: selectedCollege?.college_name_e,
      // degree_programme_name_e: selectedDegreePro[0]?.degree_programme_name_e,
      // degree_name_e: "Test"
      // orientation: 'landscape'
    }, "UIDN_Report_Not_finalize", "common").pipe(take(1)).subscribe(() => console.log("PDF Generated"));
  }



}
