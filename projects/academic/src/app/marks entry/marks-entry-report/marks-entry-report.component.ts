import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'shared';


@Component({
  selector: 'app-marks-entry-report',
  standalone: false,
  templateUrl: './marks-entry-report.component.html',
  styleUrl: './marks-entry-report.component.scss'
})
export class MarksEntryReportComponent {

  getData: any
  List: any;
  showPayload: any;
  formValueData: any;
  academic_session_id: any;
  acadmcSesnList: any;
  semester_id: any;

  constructor(private HTTP :HttpService, public dialogRef: MatDialogRef<MarksEntryReportComponent>, @Inject(MAT_DIALOG_DATA) public data: any ) {
    console.log('Received in Dialog:', data);

    this.List=data.students
    this.showPayload = data.selectedCourse
    this.optionStudent.payload.college_name_e = this.showPayload.college_name_e;
    this.optionStudent.payload.course_code = this.showPayload.course_code;
    this.optionStudent.payload.course_year_name_e = this.showPayload.course_year_name_e;

    this.getData = data.item
    this.formValueData = data.formHeader
    this.academic_session_id = data.formHeader.academic_session_id
    this.semester_id = data.formHeader.semester_id
    this.formValueData = data.formHeader.exam_paper_type_id   
     this.optionStudent.dataSource = this.List;
      this.optionStudent.listLength = this.List.length;
      this.optionStudent = {
    is_read: true,
    orientation: 'p',
    listLength: this.List.length,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: this.List,
    button: ['print', 'pdf', 'copy', 'excel'],
    is_render: true,
    page: 0,
    pageSize: 10,
    title: 'Marks Entry Report',
    payload: {
      college_name_e: this.showPayload.college_name_e,
      academic_session_name_e:this.acadmcSesnList,
      course_year_name_e: this.showPayload.course_year_name_e,
      course_code:this.showPayload.course_code
    }
  };
  }

      ngOnInit(): void {
        this.getAcademicSessionName(this.academic_session_id);
              this.getSemesterName(this.semester_id);
  }


getAcademicSessionName(academic_session_id: any) {
  this.HTTP.getParam('/master/get/getAcademicSession1/', { academic_session_id }, 'academic').subscribe((result: any) => {
      const sessionName = result?.body?.data?.[0]?.academic_session_name_e;
      // ✅ update payload dynamically
      this.optionStudent.payload.academic_session_name_e = sessionName;
    });
}

  getSemesterName(semester_id: any) {
    this.HTTP.getParam('/master/get/getSemesterList/', {semester_id},'academic').subscribe((result: any) => {
     const sessionName = result?.body?.data?.[0]?.semester_name_e;
      // ✅ update payload dynamically
      this.optionStudent.payload.semester_name_e = sessionName;
    });
  }


      optionStudent: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    is_render: true,
    page: 0,
    pageSize: 10,
    title: 'Marks Entry Report',
    payload: {college_name_e : '',}
  };



}
