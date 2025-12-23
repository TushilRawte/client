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
  isListLoaded = false;


  constructor(private HTTP: HttpService, private fb: FormBuilder) {}

   tableOptions: any = {
    is_read: true,
    listLength: 0,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    is_filter: true,
    page: 0,
    pageSize: 20,
    is_pagination: true,
    title: 'List of Faculty',
  };

  ngOnInit() {
    this.mainforfun();
  }

  mainforfun() {
    this.facultyListFormGroup = this.fb.group({
      academic_session: [null, Validators.required],
      degree_programme: [null, Validators.required],
      course_year: [null, Validators.required],
      course_nature: [null],
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
      '/master/get/getAcademicSession',
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
      '/master/get/getDegreeProgramme',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.degree_programme = !result.body.error ? result.body.data : [];
    });
  }

  getCollegeData() {
    this.HTTP.getParam(
      '/master/get/getCollegeList',
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

  onGetList() {
    const formValue = this.facultyListFormGroup.value;

    // Helper function to safely get label by ID
    const findLabel = (list: any[], id: any, idKey: string, labelKey: string) =>
      list.find(item => item[idKey] === id)?.[labelKey] || null;

    const params = {
      academic_session_id: formValue.academic_session,
      course_year_id: formValue.course_year,
      semester_id: formValue.semester,
      degree_programme_id: formValue.degree_programme,
      college_id: formValue.college,
      course_nature_id: formValue.course_nature,
      degree_programme_name_e: findLabel(this.degree_programme, formValue.degree_programme, 'degree_programme_id', 'degree_programme_name_e'),
      college_name_e: findLabel(this.college, formValue.college, 'college_id', 'college_name_e')
    };

    this.HTTP.getParam('/course/get/getFacultyListRegisteredCourses', params, 'academic').subscribe((result: any) => {
          this.faculty_list = result?.body?.data || [];
          this.tableOptions.dataSource = this.faculty_list;
          this.tableOptions.listLength = this.faculty_list.length;
          this.isListLoaded = true;
        });
  }

  onRefresh() {
    this.facultyListFormGroup.reset();
    this.isListLoaded = false;
    this.faculty_list.length = 0;
  }

}

