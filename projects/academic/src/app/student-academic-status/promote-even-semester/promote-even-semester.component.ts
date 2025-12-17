import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, HttpService } from 'shared'; 

@Component({
  selector: 'app-promote-even-semester',
  standalone: false,
  templateUrl: './promote-even-semester.component.html',
  styleUrl: './promote-even-semester.component.scss'
})
export class PromoteEvenSemesterComponent {

  promoteStudentFormGroup!: FormGroup
  acadmcSesnList: any;
  collegeList: any;
  yearList: any;
  semesterList: any;
  getDeanCommiteeList: any;
  degreeProgramme: any;
  studentList: any;

    constructor(private HTTP: HttpService, private fb : FormBuilder,private alert: AlertService,) {}

ngOnInit(): void {
  this.getAcademicSession();
  this.getYearData();
  this.getSemester();
  this.getDeanCommitee();
  this.getDegreeProgramme();
  this.promoteEvenSem();
}


 promoteEvenSem() {
  this.promoteStudentFormGroup = this.fb.group({
    academic_session_id: ['', Validators.required],
    semester_id: ['', Validators.required],
    course_year_id: ['', Validators.required],
    degree_programme_id:['', Validators.required],
    dean_committee_id: ['', Validators.required],
    // Bulk student data
    students: this.fb.array([])   // <--- FormArray for rows
  });
}

get students(): FormArray {
  return this.promoteStudentFormGroup.get('students') as FormArray;
}


    // ✅ Dropdown API calls (using your same HTTP pattern)
    getAcademicSession(){
      this.HTTP.getParam('/master/get/getAcademicSession1/', {}, 'academic').subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data;
    });
  }
  
  getYearData() {
    this.HTTP.getParam('/master/get/getCourseYearList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.yearList = result.body.data;
    })
  }

    getSemester(){
    this.HTTP.getParam('/master/get/getSemesterList/', {},'academic').subscribe((result: any) => {
      this.semesterList = result.body.data;
    });
  }
    getDeanCommitee() {
    this.HTTP.getParam('/master/get/getDeanCommitee/',{} ,'academic').subscribe((result:any) => {
      this.getDeanCommiteeList = result.body.data;
      // console.log('Course Year List:', this.getDeanCommiteeList);
    })
  }

  getDegreeProgramme() {
  this.HTTP.getParam('/master/get/getDegreePrograamList/', {}, 'academic')
    .subscribe((result: any) => {
      this.degreeProgramme = result.body.data;
    });
}

getStudentList()
{
  const formData = this.promoteStudentFormGroup.value;
  if(formData.academic_session_id == '' || formData.semester_id == '' || formData.course_year_id == '' || formData.degree_programme_id == '' || formData.dean_committee_id == ''){
    alert('Please fill all required fields');
    return;
  }
  console.log(formData, 'formdata');
  const params = {
    academic_session_id: formData.academic_session_id  + 1,
    academic_session_id2: formData.academic_session_id,
    academic_session_id3: formData.academic_session_id,
    semester_id: formData.semester_id,
    course_year_id: formData.course_year_id,
    degree_programme_id: formData.degree_programme_id,
    dean_committee_id: formData.dean_committee_id
  }
  this.HTTP.getParam('/academicStatus/get/getStudentListforEvenSemPromote/', params, 'academic')
    .subscribe((result: any) => {
      this.studentList = result.body.data;
      console.log(this.studentList, 'student list');
    });
  
}
// academic_session_id,academic_session_id2,academic_session_id3,course_year_id,degree_programme_id,dean_committee_id,semester_id

}
