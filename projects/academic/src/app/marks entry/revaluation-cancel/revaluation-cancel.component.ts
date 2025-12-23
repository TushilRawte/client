import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormArray, AbstractControl } from '@angular/forms';
import { HttpService,AlertService, PrintService } from 'shared';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-revaluation-cancel',
  standalone: false,
  templateUrl: './revaluation-cancel.component.html',
  styleUrl: './revaluation-cancel.component.scss'
})
export class RevaluationCancelComponent implements OnInit {

  allotForm!: FormGroup;
  academicSessions: any[] = [];
  semesterList: any[] = [];
 revalCancelData: any[] = [];
 selectAll = false;
  constructor(private fb: FormBuilder, private HTTP : HttpService) {}

  ngOnInit(): void {
    this.buildForm();
    this.getAcademicSession();
    this.getSemester();
  }

  buildForm() {
    this.allotForm = this.fb.group({
      academicSession: [''],
      semester: [''],
      studentId: ['']
    });
  }

  getAcademicSession() {
   

    this.HTTP.getParam('/master/get/getAcademicSession/', {}, 'academic')
      .subscribe((result: any) => {
        this.academicSessions = result.body?.data || [];
 console.log("result",result);
        if (this.academicSessions.length === 1) {
          this.allotForm.patchValue({
            academicSession: this.academicSessions[0].academic_session_id
          });
        }
      });
     
      
  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/', {}, 'academic')
      .subscribe((result: any) => {
        this.semesterList = result.body.data || [];
        console.log(result);
        
      });
  }
  getRevalCancelData() {

  if (this.allotForm.invalid) {
    this.allotForm.markAllAsTouched();
    return;
  }

  const f = this.allotForm.value;

  const params = {
    appliedSession: f.academicSession,                
    applied_academic_session_id: f.academicSession,   
    appliedSemesterid: f.semester,                    
    applied_semester_id: f.semester,                  
    student_master_id: f.studentId                    
  };

  console.log("API PARAMS:", params);

  this.HTTP.getParam('/markEntry/get/getRevalCancelData', params, 'academic')
    .subscribe((result: any) => {
      this.revalCancelData = result?.body?.data || [];
      console.log("Revaluation Cancel Data:", this.revalCancelData);
    });
}
// Add these properties
deleteRemark: string = '';

// Add these methods
hasSelectedRecords(): boolean {
  return this.revalCancelData.some(record => record.selected);
}

removeSelectedRecords() {
  const selectedRecords = this.revalCancelData.filter(record => record.selected);
  
  if (!this.deleteRemark || this.deleteRemark.trim() === '') {
    // Show error - delete remark is required
    alert('Please enter a delete remark');
    return;
  }
  
  console.log('Selected Records:', selectedRecords);
  console.log('Delete Remark:', this.deleteRemark);
  
  // Call your delete API here with selectedRecords and deleteRemark
}

//DELETE SELECTED
deleteOneSubject() {

  if (!this.selectedRow) {
    console.error("No row selected.");
    return;
  }

  const payload = {
    revaluation_detail_id: this.selectedRow.revaluation_detail_id,
    course_id: this.selectedRow.course_id,
    delete_remark: this.deleteRemark,
    order_copy: this.selectedRow.order_copy || null
  };

  console.log("Deleting single subject payload:", payload);

  this.HTTP.putData('/markEntry/update/deleteSelectedReval', payload, 'academic')
    .subscribe((res: any) => {
      if (!res.body.error) {
        alert("Selected Subject Deleted.");
        this.getRevalCancelData();
      } else {
        alert(res.body.error.message || "Error deleting subject.");
      }
    });
}
selectedRow: any = null;
showPopup = false;

popupAction = "";     // "single" or "all"
popupTitle = "";

selectRow(row: any) {
  this.selectedRow = row;
}

/* POPUP HANDLERS */
openDeleteSinglePopup() {
  this.popupAction = "single";
  this.popupTitle = "Delete Selected Subject";
  this.showPopup = true;
}

openDeleteAllPopup() {
  this.popupAction = "all";
  this.popupTitle = "Delete All Subjects";
  this.showPopup = true;
}

closePopup() {
  this.showPopup = false;
  this.deleteRemark = "";
}

confirmDelete() {
  if (this.popupAction === "single") {
    this.deleteOneSubject();
  } else {
    this.deleteAllSubjects();
  }

  this.closePopup();
}

//DELETE ALL
deleteAllSubjects() {

  const payload = {
    revaluation_main_id: this.revalCancelData[0].revaluation_main_id,
    delete_remark: this.deleteRemark,
    order_copy: null,
    details: this.revalCancelData.map(r => ({
      revaluation_detail_id: r.revaluation_detail_id
    }))
  };

  console.log("Deleting ALL subjects payload:", payload);

  this.HTTP.putData('/markEntry/update/deleteAllReval', payload, 'academic')
    .subscribe((res: any) => {
      if (!res.body.error) {
        alert("All Subjects Deleted.");
        this.revalCancelData = [];
      } else {
        alert(res.body.error.message || "Error deleting all.");
      }
    });
}







}