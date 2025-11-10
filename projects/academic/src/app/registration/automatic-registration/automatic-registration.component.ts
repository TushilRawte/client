import { Component } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { HttpService } from 'shared';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-automatic-registration',
  standalone: false,
  templateUrl: './automatic-registration.component.html',
  styleUrl: './automatic-registration.component.scss',
})
export class AutomaticRegistrationComponent {
  automaticCourseRegFormGroup!: FormGroup;
  acadmcSession: any[] = [];
  course_year: any[] = [];
  semester: any[] = [];
  degreeProgramme: any[] = [];
  deanCommitte: any[] = [];

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.mainforfun();

  }

    mainforfun() {
      this.automaticCourseRegFormGroup = this.fb.group({
        academic_session: [null, Validators.required],
        degree_programme: [null, Validators.required],
        course_year: [null, Validators.required],
        semester: [null, Validators.required],
        dean_committee: [null, Validators.required],
      });
    this.getAcademicSession();
    this.getDegreeProgramme();
    this.getCourseYear();
    this.getSemester();
    this.getDeanCommitte()
    }

  getAcademicSession() {
    this.HTTP.getParam(
      '/master/get/getAcademicSession1',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.acadmcSession = !result.body.error ? result.body.data : [];
    });
  }

  getSemester() {
    this.HTTP.getParam(
      '/master/get/getSemesterList',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.semester = !result.body.error ? result.body.data : [];
    });
  }

  getDegreeProgramme() {
    this.HTTP.getParam(
      '/master/get/getDegreePrograamList',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.degreeProgramme = !result.body.error ? result.body.data : [];
    });
  }

  getDeanCommitte() {
    this.HTTP.getParam(
      '/master/get/getDeanCommitee',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.deanCommitte = !result.body.error ? result.body.data : [];
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
}
