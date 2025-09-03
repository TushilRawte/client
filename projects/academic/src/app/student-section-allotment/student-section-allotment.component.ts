import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray,Validators } from '@angular/forms';
import { HttpService,AlertService } from 'shared';


@Component({
  selector: 'app-student-section-allotment',
  standalone: false,
  templateUrl: './student-section-allotment.component.html',
  styleUrl: './student-section-allotment.component.scss'
})
export class StudentSectionAllotmentComponent {

  studentSectionAlotFormGroup!:FormGroup
  acadmcSesnList: any;
  degreeProgramme: any;
  semesterList: any;
  courseYearList: any;

    constructor(  private fb: FormBuilder,private HTTP : HttpService,private alert:AlertService) {}

    ngOnInit(){
      this.allotFormfun();
      this.getAcademicSession();
      this.getDegreeProgramme();
      this.getSemester();
      this.getCourseYearList();
      this.loadStudents();
    }

    allotFormfun(){
      this.studentSectionAlotFormGroup = this.fb.group({
           academic_session_id: ['', Validators.required],
              degree_programme_id: ['',],
              semester_id: ['', Validators.required],
              course_year_id: [null, Validators.required],
              degree_programme_type_id:[null, ],
              sectionrows: this.fb.array([])
      })
    }

      get sectionrows(): FormArray {
    return this.studentSectionAlotFormGroup.get('sectionrows') as FormArray;
  }

  addSectionRow(student: any) {
  const row = this.fb.group({
    ue_id: [student.ue_id],
    section_id: [''],
    student_name: [student.student_name],
    academic_status: [student.academic_status],  
  });
  this.sectionrows.push(row);
}

  loadStudents() {
  this.students.forEach((student: any) => {
    this.addSectionRow(student);
  });
}


    getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession1/',{},'academic').subscribe((result:any) => {
      this.acadmcSesnList = result.body.data;
    })
  }

    getDegreeProgramme() {
    this.HTTP.getParam('/master/get/getDegreePrograamList/',{},'academic').subscribe((result:any) => {
      // console.log('GP',result);
      this.degreeProgramme = result.body.data;
    })
  }

    getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.semesterList = result.body.data;
    })
  }

    getCourseYearList() {
    this.HTTP.getParam('/master/get/getCourseYearList/',{} ,'academic').subscribe((result:any) => {
      this.courseYearList = result.body.data;
      console.log('Course Year List:', this.courseYearList);
    })
  }

  sections = [
    { section_name: 'A', section_id: 1 },
    { section_name: 'B', section_id: 2 },
    { section_name: 'C', section_id: 3 },
    { section_name: 'D', section_id: 4 }
  ];

  students = [
  { ue_id: 1001, student_name: 'Rahul Sharma', academic_status: 'Active' },
  { ue_id: 1002, student_name: 'Priya Verma', academic_status: 'Active' },
  { ue_id: 1003, student_name: 'Amit Patel', academic_status: 'Inactive' },
  { ue_id: 1004, student_name: 'Sneha Gupta', academic_status: 'Active' },
  { ue_id: 1005, student_name: 'Vikas Yadav', academic_status: 'Suspended' },
  { ue_id: 1006, student_name: 'Neha Singh', academic_status: 'Active' },
  { ue_id: 1007, student_name: 'Rohit Mehra', academic_status: 'Active' },
  { ue_id: 1008, student_name: 'Anjali Nair', academic_status: 'Inactive' },
  { ue_id: 1009, student_name: 'Karan Joshi', academic_status: 'Active' },
  { ue_id: 1010, student_name: 'Divya Kapoor', academic_status: 'Active' }
];








    
  
}
