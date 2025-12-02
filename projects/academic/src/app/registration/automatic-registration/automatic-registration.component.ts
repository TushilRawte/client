import { Component } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { HttpService } from 'shared';


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
  student_list: any[] = [];
  isListLoaded = false;

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
  ) { }

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
    this.automaticCourseRegFormGroup = this.fb.group({
      academic_session: [null, Validators.required],
      degree_programme: [null, Validators.required],
      course_year: [null, Validators.required],
      semester: [null, Validators.required],
      dean_committee: [null, Validators.required], 
      is_new_std: [false], 


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

  getPaidAndUnpaidStudents(status:string){
    const formValue = this.automaticCourseRegFormGroup.value;
       const params = {
      academic_session_id: formValue.academic_session,
      degree_programme_id: formValue.degree_programme,
      course_year_id: formValue.course_year,
      semester_id: formValue.semester,
      dean_committee_id: formValue.dean_committee,
      is_new_std:formValue.is_new_std,
      payment: true,
      fee_status:true,
      status
    };
  this.HTTP.getParam('/course/get/getPaidAndUnpaidStudents', params, 'academic').subscribe((result: any) => {
          const studentList = result?.body?.data || [];
          if(status === 'paid'){
            this.student_list = studentList.filter((s:any)=>s.fee_status != "Not Paid" && s.exam_fee_status != "Not Paid(Exam Fee)" )
          }else{
            this.student_list = studentList.filter((s:any)=>s.fee_status == "Not Paid" || s.exam_fee_status == "Not Paid(Exam Fee)" )
          }
          this.tableOptions.dataSource = this.student_list;
          this.tableOptions.listLength = this.student_list.length;
          this.isListLoaded = true;
        });
  }

}
