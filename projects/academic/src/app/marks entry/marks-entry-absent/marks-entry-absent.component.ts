import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { AlertService, AuthService, HttpService, PrintService } from 'shared';
import { MarksEntryReportComponent } from '../marks-entry-report/marks-entry-report.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-marks-entry-absent',
  standalone: false,
  templateUrl: './marks-entry-absent.component.html',
  styleUrl: './marks-entry-absent.component.scss'
})
export class MarksEntryAbsentComponent {


   marksEntryFacultyFormGroup!:FormGroup
  degreeProgrammeTypeList: any;
  remarkList: any;
  selectedDegreeProTypeId: any;
  examPaperTypenameSelected: any;
  notShowInternal: boolean = false;
  emp_id: any;
  degreeProgrammeList: any;
  studentList: any;
   


    constructor(private fb: FormBuilder,private HTTP :HttpService, private alert: AlertService,private dialog: MatDialog, private  auth:AuthService){ }



  getEmployeeID(){
    this.emp_id = this.auth.getEmpID();
    console.log(this.emp_id);

  }

  
  ngOnInit(): void {
        this.marksEntryAdmin();
        this.getRemark();
        this.marksEntryFacultyFormGroup.get('valuation_type_id')?.valueChanges.subscribe(value => {
  // force re-render when valuation type changes
  // this.students.updateValueAndValidity();
});


  }

marksEntryAdmin() {
  this.marksEntryFacultyFormGroup = this.fb.group({
    academic_session_id: ['', Validators.required],
    semester_id: ['', Validators.required],
    exam_paper_type_id: ['', Validators.required],
    dean_committee_id: ['', Validators.required],
    exam_type_id: ['',Validators.required],
    valuation_type_id: ['', Validators.required],
    college_id: [''],
    course_year_id: ['', Validators.required],
    degree_programme_id: ['', Validators.required],
    student_master_id: [''],
    
    // FormArray for student rows
    students: this.fb.array([])
  });
}

// Getter for students FormArray
get students(): FormArray {
  return this.marksEntryFacultyFormGroup.get('students') as FormArray;
}

// Method to populate FormArray with student data
populateStudents(studentList: any[]) {
  // Clear existing students
  this.students.clear();
  
  studentList.forEach((student: any,) => {
    const studentForm = this.fb.group({
      student_master_id: [student.student_master_id],
      course_code: [student.course_code],
      obtained_mark: [0, [Validators.min(0)]], // Default to 0
      remark_id: [4],
      other_remark: [],
      
      // Hidden fields for reference
      ue_id: [student.ue_id],
      registration_id: [student.registration_id],
      course_id: [student.course_id],
      college_id: [student.college_id],
      course_nature_id: [student.course_nature_id],
      exam_paper_type_id: [this.marksEntryFacultyFormGroup.get('exam_paper_type_id')?.value],
      academic_session_id: [this.marksEntryFacultyFormGroup.get('academic_session_id')?.value],
      degree_programme_id: [this.marksEntryFacultyFormGroup.get('degree_programme_id')?.value],
      semester_id: [this.marksEntryFacultyFormGroup.get('semester_id')?.value],
      dean_committee_id: [this.marksEntryFacultyFormGroup.get('dean_committee_id')?.value],
      course_year_id: [this.marksEntryFacultyFormGroup.get('course_year_id')?.value],
      exam_type_id: [this.marksEntryFacultyFormGroup.get('exam_type_id')?.value],
      valuation_type_id: [this.marksEntryFacultyFormGroup.get('valuation_type_id')?.value],

    });
    
    this.students.push(studentForm);
  });
}


  getDegreeProgrammeTypeData(){
    this.HTTP.getParam( '/master/get/getDegreeProgramType/',{},'academic').subscribe((result: any) => {
      this.degreeProgrammeTypeList = result?.body?.data;
    });
  }

    getRemark() {
    this.HTTP.getParam('/master/get/getRemark/',{} ,'academic').subscribe((result:any) => {
      this.remarkList = result.body.data;
    })
  }

  onDegreeProgrammeChange(selected: any) {
  if (!selected) return;
  console.log(selected);
  console.log('i am called');
  
  this.selectedDegreeProTypeId = selected.degree_programme_type_id;
  this.marksEntryFacultyFormGroup.patchValue({
    degree_programme_id: selected.degree_programme_id,
    degree_programme_type_id: this.selectedDegreeProTypeId
  });
}

  onExamPaperTypeChange(selected: any) {
  this.marksEntryFacultyFormGroup.patchValue({
    exam_paper_type_id: selected.exam_paper_type_id,
    course_nature_id: selected.course_nature_id   // <-- set course nature here
  });
   this.examPaperTypenameSelected = selected.exam_paper_type_name_e;
   // Show/hide internal marks based on paper type
   if(selected.exam_paper_type_id === 9 ){
    this.notShowInternal=true
   }
   else{
    this.notShowInternal=false
   }
}

getStudent(){
if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }
  const formValue = this.marksEntryFacultyFormGroup.value;
  console.log('Form Value:', formValue);
    const params: any = {
    academic_session_id: formValue.academic_session_id,
    degree_programme_id: formValue.degree_programme_id,
    course_year_id: formValue.course_year_id,
    dean_committee_id: formValue.dean_committee_id,
    course_semester_id: formValue.semester_id,
    exam_paper_type_id: formValue.exam_paper_type_id,
     academic_session_id2: formValue.academic_session_id,
    degree_programme_id2: formValue.degree_programme_id,
    course_year_id2: formValue.course_year_id,
    dean_committee_id2: formValue.dean_committee_id,
    semester_id: formValue.semester_id,
    student_master_id: formValue.student_master_id

  }
  this.HTTP.getParam('/markEntry/get/getAbsentStudentForMaarksEntry/', params, 'academic').subscribe((res: any) => {
    if (!res.body.error) {
      if (res.body.data && res.body.data.length > 0) {
        this.studentList = res.body.data;
        this.populateStudents(this.studentList)
        // console.log("✅ Course List:", res.body.data);
      } else {
        this.alert.alertMessage("No Data Found...!", "", "warning");
        this.studentList = [];
      }
    } else {
      this.alert.alertMessage("Something Went Wrong...!", "", "warning");
    }
  });
}


onSubmit() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }
  
  const { students, ...rest } = this.marksEntryFacultyFormGroup.value;
  
  // Check if students array exists and has data
  if (!students || !Array.isArray(students) || students.length === 0) {
    this.alert.alertMessage("Error", "No student data to submit", "warning");
    return;
  }
  
  // Prepare student data with additional form values
  const studentPayload = students.map(student => ({
    ...student,
    // Include all other form values in each student object
    academic_session_id: rest.academic_session_id,
    semester_id: rest.semester_id,
    exam_paper_type_id: rest.exam_paper_type_id,
    dean_committee_id: rest.dean_committee_id,
    exam_type_id: rest.exam_type_id,
    valuation_type_id: rest.valuation_type_id,
    // college_id: rest.college_id,
    course_year_id: rest.course_year_id,
    degree_programme_id: rest.degree_programme_id,
  }));
  
  console.log('Student Payload (Array):', studentPayload);
  

  this.HTTP.postData('/attendance/post/saveStudentMarkEntryInternalManually', studentPayload, 'academic').subscribe(res => {
    if (!res.body.error) {
      this.alert.alertMessage("Record Inserted!", "", "success");
       this.studentList = [];
    } else {
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
    }
  });
}


}
