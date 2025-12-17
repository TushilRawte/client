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

  constructor(private HTTP :HttpService, public dialogRef: MatDialogRef<MarksEntryReportComponent>, @Inject(MAT_DIALOG_DATA) public data: any ) {
    console.log('Received in Dialog:', data);
    console.log('hrk',data.students);
    this.List=data.students
    this.showPayload = data.selectedCourse
    this.optionStudent.payload.college_name_e = this.showPayload.college_name_e;
    this.optionStudent.payload.course_code = this.showPayload.course_code;
    this.optionStudent.payload.course_year_name_e = this.showPayload.course_year_name_e;

    this.getData = data.item
    this.formValueData = data.formHeader
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
      academic_session_name_e: "2024-25",
      course_year_name_e: this.showPayload.course_year_name_e,
      semester_name_e: "1st Semester",
      course_code:this.showPayload.course_code
    }
  };
  }

      ngOnInit(): void {
        
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
