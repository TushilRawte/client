import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-src-generate',
  standalone: false,
  templateUrl: './src-generate.component.html',
  styleUrl: './src-generate.component.scss'
})
export class SrcGenerateComponent {

  srcGenerateFormGroup!:FormGroup
  selectedDegreeProTypeId: any;
  studentList: any;
  selectAll = false;
  dashboardList: any;


  constructor(private fb: FormBuilder,private HTTP :HttpService, private alert: AlertService,){ }
  
  ngOnInit(): void {  
    this.marksEntryAdmin();
  }

    marksEntryAdmin() {
  this.srcGenerateFormGroup = this.fb.group({
    academic_session_id: ['', Validators.required],
    semester_id: ['', Validators.required],
    exam_type_id: ['', Validators.required],
    college_id:['',Validators.required],
    course_year_id: ['',Validators.required],
    degree_programme_id:['',Validators.required],
    dean_committee_id:['',Validators.required],

    // Bulk student data
    students: this.fb.array([])   // <--- FormArray for rows
  });
}

get students(): FormArray {
  return this.srcGenerateFormGroup.get('students') as FormArray;
}


onDegreeProgrammeChange(selected: any) {
  if (!selected) return;
  console.log(selected);
  console.log('i am called');
  
  this.selectedDegreeProTypeId = selected.degree_programme_type_id;
  this.srcGenerateFormGroup.patchValue({
    degree_programme_id: selected.degree_programme_id,
    degree_programme_type_id: this.selectedDegreeProTypeId
  });
}

getDashboard(){
  if (this.srcGenerateFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }
  const formValue = this.srcGenerateFormGroup.value;
  console.log(formValue);
  const params = {
    academic_session_id: formValue.academic_session_id,
    college_id: formValue.college_id,
    semester_id: formValue.semester_id,
    exam_type_id: formValue.exam_type_id,
    course_year_id: formValue.course_year_id,
    dean_committee_id: formValue.dean_committee_id,
    
    // degree_programme_id: formValue.degree_programme_id, here need to pass degree programme after update degree proramme id in src main
    }
    this.HTTP.getParam('/src/get/srcGeneratedDashboard/', params, 'academic').subscribe((res: any) => {
    if (!res.body.error) {
      if (res.body.data && res.body.data.length > 0) {
        this.dashboardList = res.body.data;
          this.students.clear();
         this.studentList = [];
      } else {
        this.alert.alertMessage("No Data Found...!", "", "warning");
         this.dashboardList = [];
           this.students.clear();
          this.studentList = [];
      }
    } else {
      this.alert.alertMessage("Something Went Wrong...!", "", "warning");
       this.dashboardList = [];
         this.students.clear();
         this.studentList = [];
    }
  });
}



viewDetails(status: string){
  if (this.srcGenerateFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }
  const formValue = this.srcGenerateFormGroup.value;
  console.log(formValue);
  const params = {
    academic_session_id: formValue.academic_session_id,
    college_id: formValue.college_id,
    semester_id: formValue.semester_id,
    exam_type_id: formValue.exam_type_id,
    course_year_id: formValue.course_year_id,
    dean_committee_id: formValue.dean_committee_id,
    generated_yn: status,
    
    // degree_programme_id: formValue.degree_programme_id, here need to pass degree programme after update degree proramme id in src main
    // degree_programme_type_id: this.selectedDegreeProTypeId
    }
    this.HTTP.getParam('/src/get/getStudentForGenerateSRC/', params, 'academic').subscribe((res: any) => {
    if (!res.body.error) {
      if (res.body.data && res.body.data.length > 0) {
        this.studentList = res.body.data;
         this.loadStudentData(this.studentList);
      } else {
         this.students.clear();
         this.studentList = [];
        this.alert.alertMessage("No Data Found...!", "", "warning");
      }
    } else {
         this.students.clear();
         this.studentList = [];
      this.alert.alertMessage("Something Went Wrong...!", "", "warning");
    }
  });
}

// Example: populate form array after fetching data
  loadStudentData(data: any[]) {
    this.students.clear();
   const commonValues = this.srcGenerateFormGroup.value; // capture main form values

    data.forEach(row => {
      this.students.push(this.createStudentForm(row, commonValues));
    });
  }

  // ✅ Add both student data + main form values
  createStudentForm(row: any, commonValues: any): FormGroup {
    return this.fb.group({
      selected: [false],
      ue_id: [row.ue_id],
      registration_id: [row.registration_id],
      student_name: [row.student_name],
      registered_courses: [row.registered_courses],
      registered_paper: [row.registered_paper],
      marks_entered: [row.marks_entered],
      marks_not_enterd: [row.marks_not_enterd],
      marks_finalize: [row.marks_finalize],
      generated_yn: [row.generated_yn],
      prevent_certificate_generation: [row.prevent_certificate_generation],

      // ✅ map main form values
      academic_session_id: [commonValues.academic_session_id],
      semester_id: [commonValues.semester_id],
      exam_type_id: [commonValues.exam_type_id],
      college_id: [commonValues.college_id],
      course_year_id: [commonValues.course_year_id],
      degree_programme_id: [commonValues.degree_programme_id],
      dean_committee_id: [commonValues.dean_committee_id]
    });
  }

 toggleSelectAll(event: any) {
    this.selectAll = event.target.checked;
    this.students.controls.forEach(ctrl => {
      ctrl.get('selected')?.setValue(this.selectAll);
    });
  }

  onRowCheckboxChange() {
    const allSelected = this.students.controls.every(c => c.get('selected')?.value);
    this.selectAll = allSelected;
  }

  // Example method to get selected rows
  getSelectedStudents() {
    return this.students.value.filter((s: any) => s.selected);
  }

  generateSRC() {
    const selectedStudents = this.getSelectedStudents();
     if (selectedStudents.length === 0) {
      this.alert.alertMessage("No Selection", "Please select at least one student.", "warning");
      return;
    }
    console.log(selectedStudents);
    this.HTTP.postData('/src/post/insertStudentListTempTablForSrcGenrt', selectedStudents, 'academic').subscribe(res => {
    if (!res.body.error){
            this.alert.alertMessage("Record Inserted!", "", "success");
    }
    else
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
  });
    
  }

insertMan(){
   const confirmed = confirm("Are you confirm to prepared data for src generation");
  if (!confirmed) return;
    const formValue = this.srcGenerateFormGroup.value;
  console.log(formValue);
  const params = {
    academic_session_id: formValue.academic_session_id,
    college_id: formValue.college_id,
    semester_id: formValue.semester_id,
    exam_type_id: formValue.exam_type_id,
    course_year_id: formValue.course_year_id,
    }
 this.HTTP.postData('/src/post/bulkSRCGenerate', params, 'academic').subscribe(res => {
    if (!res.body.error){
            this.alert.alertMessage("Record Inserted!", "", "success");
    }
    else
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
  });

}



}

