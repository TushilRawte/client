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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,private HTTP : HttpService,private alert:AlertService,
    private dialogRef: MatDialogRef<TeacherSectionAllotmentComponent>
  ) {}

  ngOnInit() {
    this.courseData = this.data.courseData;
    this.currentData = this.data.currentData;

    // Flatten and filter unique teachers
    this.courseData1 = this.data.courseData
      .flatMap((c: { teacherRows: any[] }) => c.teacherRows)
      .filter(
        (teacher: { emp_id: any }, index: number, self: any[]) =>
          index === self.findIndex(t => t.emp_id === teacher.emp_id)
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
          // allotment_detail_id: [t.allotment_detail_id], if use allotment_detail_id u can uncomment 
          section_id: ['']   
        })
      );
    });
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


  onSubmit() {
    console.log('Form submitted with value:', this.teacherSectionForm.value);
    const payload = this.teacherSectionForm.value
    // this.HTTP.getParam('',payload, 'academic').subscribe(res => {
    //   if(!res.body.error){
    //     this.alert.alertMessage("Record Inserted...!", "", "success");
    //   }
    //   else{
    //     this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
    //   }
    // })
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
