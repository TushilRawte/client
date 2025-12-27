import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
import { MatDialog } from '@angular/material/dialog';
import { CheckDocumentForUidnComponent } from '../check-document-for-uidn/check-document-for-uidn.component';

@Component({
  selector: 'app-generate-uidn',
  standalone: false,
  templateUrl: './generate-uidn.component.html',
  styleUrl: './generate-uidn.component.scss'
})
export class GenerateUidnComponent {

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
      academic_session_id: [{ value: '', disabled: true }],
      college_id: ['', Validators.required],
      degree_id: ['', Validators.required],

      students: this.fb.array([])   // <– FormArray like previous code
    });
  }

  get students(): FormArray {
    return this.generateUIDNFormGroup.get('students') as FormArray;
  }


  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession', { currently_running: 'Y' }, 'academic').subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data || [];
      if (this.acadmcSesnList.length > 0) {
        this.generateUIDNFormGroup.patchValue({
          ...this.generateUIDNFormGroup.value,
          academic_session_id: this.acadmcSesnList[0]?.academic_session_id
        })
      }
    });
  }

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList', {}, 'academic').subscribe((result: any) => {
      // console.log(result);
      this.collegeList = result.body.data;
    })
  }

  onCollegeChange(college_id: number) {
    this.getDegree(college_id);
    // this.courseYearList = [];
  }

  getDegree(college_id: number) {
    this.HTTP.getParam('/master/get/getDegreeByDegPrgTyp', { college_id }, 'academic')
      .subscribe((result: any) => {
        this.degreeList = result.body.data;
        console.log('Initial Degree :', this.degreeList);

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
    this.generateUIDNFormGroup.patchValue({ degree_id: this.selectedDegree })

  }

  getStudentList() {
    let formData = this.generateUIDNFormGroup.getRawValue();
    console.log('Form Data to Submit:', formData);
    const payload = {
      college_id: formData.college_id,
      // degree_id: this.selectedDegree,
      degree_id: formData.degree_id,
      academic_session_id: formData.academic_session_id,
      academic_session_id2: formData.academic_session_id,
      academic_session_id3: formData.academic_session_id,
      // degree_id2: this.selectedDegree,
      degree_id2: formData.degree_id,
    };
    if (
      !payload.academic_session_id ||
      !payload.college_id ||
      !payload.degree_id
    ) {
      alert('⚠️ All fields are required!');
      return; // Stop execution
    }
    this.HTTP.getParam('/studentProfile/get/getStudentListForGenrateUIDN/', payload, 'academic').subscribe((result: any) => {
      this.studentList = result?.body?.data || [];
      console.log('Student List:', this.studentList);

      this.students.clear();
      if (this.studentList.length > 0) {
        this.studentList.forEach((row: any) => {
          this.students.push(this.createStudentRow(row, formData));
        });
      } else {
        this.alert.alertMessage(
          "No Records Found",
          result?.body?.error?.message || result?.body?.error || '',
          "warning"
        );
      }
      console.log('API Response:', result);
    });
  }

  getUploadedDocument(row: any) {
    console.log('selected row:', row);

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

      Reg_No: [row.Reg_No],
      entrance_exam_type_code: [row.entrance_exam_type_code],
      student_name: [row.student_name],
      overall_rank: [row.overall_rank],
      Admsn_Quota_Id: [row.Admsn_Quota_Id],
      Admitted_Category: [row.Admitted_Category],
      Fee_Status: [row.Fee_Status],
      Student_CID: [row.Student_CID],
      entrance_exam_type_name: [row.entrance_exam_type_name],
      admission_id: [row.admission_id],
      academic_session_id: [main.academic_session_id],
      college_id: [main.college_id],
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

    if (selectedRows.length === 0) {
      alert("⚠️ No student selected!");
      return;
    }

    this.HTTP.postData('/studentProfile/post/saveGenerateUIDN', selectedRows, 'academic')
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




}
