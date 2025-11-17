import { Component } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { HttpService } from 'shared';


@Component({
  selector: 'app-faculty-list',
  standalone: false,
  templateUrl: './faculty-list.component.html',
  styleUrl: './faculty-list.component.scss',
})
export class FacultyListComponent {
  facultyListFormGroup!: FormGroup;
  academic_session: any[] = [];
  course_year: any[] = [];
  course_nature: any[] = [];
  semester: any[] = [];
  degree_programme: any[] = [];
  college: any[] = [];
  faculty_list: any[] = [];

  constructor(private HTTP: HttpService, private fb: FormBuilder) {}

   tableOptions: any = {
    is_read: true,
    listLength: 0,
    dataSource: [],
    button: [],
    title: 'Courses List',
  };

  ngOnInit() {
    this.mainforfun();
  }

  mainforfun() {
    this.facultyListFormGroup = this.fb.group({
      academic_session: [null, Validators.required],
      degree_programme: [null, Validators.required],
      course_year: [null, Validators.required],
      course_nature: [null, Validators.required],
      semester: [null, Validators.required],
      college: [null, Validators.required],
    });
    this.getAcademicSession();
    this.getDegreeProgramme();
    this.getCourseYear();
    this.getCourseNature();
    this.getSemester();
    this.getCollegeData();
  }

  getAcademicSession() {
    this.HTTP.getParam(
      '/master/get/getAcademicSession1',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.academic_session = !result.body.error ? result.body.data : [];
    });
  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList', {}, 'academic').subscribe(
      (result: any) => {
        this.semester = !result.body.error ? result.body.data : [];
      }
    );
  }

  getDegreeProgramme() {``
    this.HTTP.getParam(
      '/master/get/getDegreePrograamList',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.degree_programme = !result.body.error ? result.body.data : [];
    });
  }

  getCollegeData() {
    this.HTTP.getParam(
      '/master/get/getCollegeList1',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.college = result.body.data;
    });
  }

  getCourseYear() {
    this.HTTP.getParam(
      '/master/get/getCourseYearList',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.course_year = !result.body.error ? result.body.data : [];
    });
  }

  getCourseNature() {
    this.HTTP.getParam(
      '/master/get/getCourseNature',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.course_nature = !result.body.error ? result.body.data : [];
    });
  }

  onGetList(){
  const parmas = {
    academic_session_id: this.facultyListFormGroup.get('academic_session')?.value,
    course_year_id: this.facultyListFormGroup.get('course_year')?.value,
    semester_id: this.facultyListFormGroup.get('semester')?.value,
    degree_programme_id: this.facultyListFormGroup.get('degree_programme')?.value,
    college_id: this.facultyListFormGroup.get('college')?.value,
    course_nature_id: this.facultyListFormGroup.get('course_nature')?.value,
    }
     this.HTTP.getParam(
      '/master/get/getCourseForUpdate',
      parmas,
      'academic'
    ).subscribe((result: any) => {
      console.log("this is result",result);  
      this.faculty_list = !result.body.error ? result.body.data : [];
    });
  }

  onRefresh() {
  this.facultyListFormGroup.reset();
}
}

