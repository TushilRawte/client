import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { HttpService,AlertService } from 'shared';

@Component({
  selector: 'app-teacher-section-allotment',
  standalone: false,
  templateUrl: './teacher-section-allotment.component.html',
  styleUrl: './teacher-section-allotment.component.scss'
})
export class TeacherSectionAllotmentComponent implements OnInit {

  courseData: any[] = [];
  currentData: any;
  courseData1: any;
  teacherSectionForm!: FormGroup;
  sections: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,private HTTP : HttpService,private alert:AlertService,
    private dialogRef: MatDialogRef<TeacherSectionAllotmentComponent>
  ) {}

  // ngOnInit() {
  //   this.getSectionList();
  //   this.courseData = this.data.courseData;
  //   this.currentData = this.data.currentData;

  //   // Flatten and filter unique teachers
  //   this.courseData1 = this.data.courseData
  //     .flatMap((c: { teacherRows: any[] }) => c.teacherRows)
  //     .filter(
  //       (teacher: { emp_id: any }, index: number, self: any[]) =>
  //         index === self.findIndex(t => t.emp_id === teacher.emp_id)
  //     );

  //     console.log('all', this.courseData);
  //   console.log('filtered', this.courseData1);

  //   // Initialize form
  //   this.teacherSectionForm = this.fb.group({
  //     teachers: this.fb.array([])
  //   });

  //   this.loadTeachers();
  // }

  ngOnInit() {
  this.getSectionList();
  this.courseData = this.data.courseData;
  this.currentData = this.data.currentData;

  // Flatten and filter unique teachers (exclude null emp_id)
  this.courseData1 = this.data.courseData
    .flatMap((c: { teacherRows: any[] }) => c.teacherRows)
    .filter(
      (teacher: { emp_id: any }, index: number, self: any[]) =>
        teacher.emp_id !== null && teacher.emp_id !== undefined && // exclude null/undefined
        index === self.findIndex(t => t.emp_id === teacher.emp_id) // keep unique
    );

  console.log('all', this.courseData);
  console.log('filtered', this.courseData1);

  // Initialize form
  this.teacherSectionForm = this.fb.group({
    teachers: this.fb.array([])
  });

  this.loadTeachers();
}


  get teachers(): FormArray {
    return this.teacherSectionForm.get('teachers') as FormArray;
  }

  loadTeachers() {
    this.courseData1.forEach((t: any) => {
      this.teachers.push(
        this.fb.group({
          emp_id: [t.emp_id],
          emp_name: [t.emp_name],
          allotment_detail_id: [t.allotment_detail_id], 
          section_id: [t.section_id]
        })
      );
    });
  }

  // sections = [
  //   { section_name: 'A', section_id: 1 },
  //   { section_name: 'B', section_id: 2 },
  //   { section_name: 'C', section_id: 3 },
  //   { section_name: 'D', section_id: 4 }
  // ];

      getSectionList() {
    this.HTTP.getParam('/master/get/getSectionList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.sections = result.body.data;
    })
  }

  onSubmit() {
    console.log('Form submitted with value:', this.teacherSectionForm.value);
    const payload = this.teacherSectionForm.value
    this.HTTP.putData('/course/update/saveTeacherSectionAllotment',payload, 'academic').subscribe(res => {
      if(!res.body.error){
        this.alert.alertMessage("Record Inserted...!", "", "success");
      }
      else{
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    })
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
