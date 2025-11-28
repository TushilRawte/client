import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'shared';

@Component({
  selector: 'app-check-document-for-uidn',
  standalone: false,
  templateUrl: './check-document-for-uidn.component.html',
  styleUrl: './check-document-for-uidn.component.scss'
})
export class CheckDocumentForUidnComponent {
  getData: any = [];
  documentList: any;
  baseUrl:string = 'https://igkv.ac.in'

  constructor(private HTTP :HttpService, public dialogRef: MatDialogRef<CheckDocumentForUidnComponent>, @Inject(MAT_DIALOG_DATA) public data: any ) {
    console.log('Received in Dialog:', data);
    this.getData = data.value
  }

    ngOnInit(): void {
    this.getStudentList();
  }

   getStudentList() {
    const params = {
      entrance_exam_type_code: this.getData?.entrance_exam_type_code,
      student_cid: this.getData?.Student_CID,
      entrance_exam_type_code2: this.getData?.entrance_exam_type_code,
      academic_session_id: this.getData?.academic_session_id,
      admission_session: this.getData?.academic_session_id,
    };
    console.log('Request Params:', params);
    
    if (
      !params.entrance_exam_type_code ||
      !params.student_cid ||
      !params.academic_session_id ||
      !params.admission_session
    ) {
      alert('⚠️ All fields are required!');
      return; 
    }
    this.HTTP.getParam( '/studentProfile/get/getStudentDocumentDetailForGenrtUIDN/',  params, 'academic' ).subscribe((result: any) => {
      this.documentList = result?.body?.data;
            this.optionsDoc.dataSource = this.documentList;
      this.optionsDoc.listLength = this.documentList.length;
      console.log('API Response:', this.documentList);
    });
  }

    optionsDoc: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: [],
    is_render: true,
    page: 0,
    pageSize: 10,
    title: 'Report Filter',
  };

  closeDialog() {
    this.dialogRef.close();
  }
}
