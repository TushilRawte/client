import { Component } from '@angular/core';
import { HttpService } from 'shared'; 
import { FormBuilder, FormGroup, Validators,FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';




@Component({
  selector: 'app-course-registration-unfinlize',
  standalone: false,
  templateUrl: './course-registration-unfinlize.component.html',
  styleUrl: './course-registration-unfinlize.component.scss'
})
export class CourseRegistrationUnfinlizeComponent {

  regUnFinalizeFormGroup!: FormGroup
  acadmcSesnList: any;
  collegeList: any;
  degreeProgramme: any;
  semesterList: any;
  courseYearList: any;
  getDeanCommiteeList: any;
  getStudentListforUnFinlz: any;
  


  constructor(private HTTP:HttpService, private fb : FormBuilder,private snackBar: MatSnackBar) { }

  ngOnInit(){
    this.getAcademicSession();
    this.getCollegeData();
    this.getSemester(); 
    this.getCourseYearList();
    this.mainforfun();
    this.getDeanCommitee();
  }

    mainforfun() {
    this.regUnFinalizeFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      college_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      course_year_id: [null, Validators.required],
      dean_committee_id: [null, Validators.required],
    });
  }

 getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession/',{},'academic').subscribe((result:any) => {
      this.acadmcSesnList = result.body.data;
    })
  }

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList/',{} ,'academic').subscribe((result:any) => {
      this.collegeList = result.body.data;
    })
  }

  onCollegeChange(college_id: number) {
  this.getDegreeProgramme(college_id); 
 }

  getDegreeProgramme(college_id:number) {
    this.HTTP.getParam('/master/get/getDegreeProgramme/',{college_id},'academic').subscribe((result:any) => {
      this.degreeProgramme = result.body.data;
    })
  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/',{} ,'academic').subscribe((result:any) => {
      this.semesterList = result.body.data;
    })
  }

  getCourseYearList() {
    this.HTTP.getParam('/master/get/getCourseYearList/',{} ,'academic').subscribe((result:any) => {
      this.courseYearList = result.body.data;
      console.log('Course Year List:', this.courseYearList);
    })
  }

    getDeanCommitee() {
    this.HTTP.getParam('/master/get/getDeanCommitee/',{} ,'academic').subscribe((result:any) => {
      this.getDeanCommiteeList = result.body.data;
      console.log('Course Year List:', this.getDeanCommiteeList);
    })
  }

  getStudentList() {
  if (!this.regUnFinalizeFormGroup.valid) {
    this.snackBar.open('Please fill all required fields', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    return;
  }

  const params = {
    academic_session_id: this.regUnFinalizeFormGroup.value.academic_session_id,
    college_id: this.regUnFinalizeFormGroup.value.college_id,
    degree_programme_id: this.regUnFinalizeFormGroup.value.degree_programme_id,
    semester_id: this.regUnFinalizeFormGroup.value.semester_id,
    course_year_id: this.regUnFinalizeFormGroup.value.course_year_id,
    dean_committee_id: this.regUnFinalizeFormGroup.value.dean_committee_id,
  };

  this.HTTP.getParam('/course/get/getStudentListForRegUnfinalize/', params, 'academic')
    .subscribe((result: any) => {
      this.getStudentListforUnFinlz = result.body.data;
      console.log('Student List:', this.getStudentListforUnFinlz);
    });
}

  unFinalizeReg(item:any){
    const params = {
      registration_id: item.registration_id
    }
   console.log('Registration_id',params);
   
  }

}
