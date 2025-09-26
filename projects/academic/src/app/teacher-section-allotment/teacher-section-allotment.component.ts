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
  getStudentCount: any;
  studentTotalCount:any
  divisionParts: any;
  divisionResult: any;
  selectedAllotmentDetailId: number | null = null;
  showSectionAllotment = false;
  

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
  // API response (already flat rows)
  this.courseData = this.data.courseData;
  this.currentData = this.data.currentData;
  console.log('all', this.courseData);
  console.log('current', this.currentData);

  // Initialize form
  this.teacherSectionForm = this.fb.group({
    teachers: this.fb.array([])
  });

  this.loadTeachers();
  this.getStudentcount();
}

get teachers(): FormArray {
  return this.teacherSectionForm.get('teachers') as FormArray;
}


loadTeachers() {
  const eligibleTeachers = this.courseData.filter((t: any) => t.eligible_course !== 'N');
  eligibleTeachers.forEach((t: any) => {
    this.teachers.push(
      this.fb.group({
        allotment_detail_id: [t.allotment_detail_id],
        emp_id: [t.emp_id],
        emp_name: [t.emp_name],
        course_id: [t.course_id],
        course_name: [t.course_name],
        section_id: [t.section_id] 
      })
    );
  });
}




      getSectionList() {
    this.HTTP.getParam('/master/get/getSectionList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.sections = result.body.data;
    })
  }


  onSubmit() {
  console.log('Form submitted with value:', this.teacherSectionForm.value);

  // take teachers array and remove rows where emp_id is null/undefined
  const filteredTeachers = this.teacherSectionForm.value.teachers.filter(
    (t: any) => t.emp_id !== null && t.emp_id !== undefined
  );

  const payload = {
    ...this.teacherSectionForm.value,
    teachers: filteredTeachers
  };

  console.log('Final payload:', payload);

  this.HTTP.putData('/course/update/saveTeacherSectionAllotment', payload, 'academic')
    .subscribe(res => {
      if (!res.body.error) {
        this.alert.alertMessage("Record Inserted...!", "", "success");
      } else {
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    });
}


 getStudentcount() {
    const params = {
      academic_session_id: this.data.currentData.academic_session_id,
      college_id: this.data.currentData.college_id,
      semester_id: this.data.currentData.semester_id,
      course_year_id: this.data.currentData.course_year_id,
      degree_programme_type_id: this.data.currentData.degree_programme_type_id
    };

    this.HTTP.getParam('/master/get/getStudentsCount/', params, 'academic')
      .subscribe((result: any) => {
        this.getStudentCount = result?.body?.data || [];
        console.log(this.getStudentCount , 'student count response');
        

        if (this.data.currentData.degree_programme_type_id === 1) {
          this.studentTotalCount = this.getStudentCount[0]?.student_count || 0;
        } else {
          this.studentTotalCount = this.getStudentCount
            .reduce((sum: number, row: any) => sum + (row.student_count || 0), 0);
        }
      });
  }

  onDivisionChange(value: number) {
    this.divisionParts = value;

    if (this.data.currentData.degree_programme_type_id === 1) {
      this.divideStudentsSimple();
    } else {
      this.divideByProgramme();
    }
  }

  // Simple even division for type 1
  // divideStudentsSimple() {
  //   if (!this.divisionParts || !this.studentTotalCount) {
  //     this.divisionResult = [];
  //     return;
  //   }

  //   const total = this.studentTotalCount;
  //   const parts = this.divisionParts;
  //   const base = Math.floor(total / parts);
  //   const remainder = total % parts;

  //   this.divisionResult = Array(parts).fill(null).map((_, i) => ({
  //     total_students: base + (i < remainder ? 1 : 0),
  //     programme_ids: [],
  //     programme_names: []
  //   }));
  // }

  divideStudentsSimple() {
  if (!this.divisionParts || !this.studentTotalCount) {
    this.divisionResult = [];
    return;
  }

  const total = this.studentTotalCount;
  const parts = this.divisionParts;
  const base = Math.floor(total / parts);
  const remainder = total % parts;

  this.divisionResult = Array(parts).fill(null).map((_, i) => ({
    total_students: base + (i < remainder ? 1 : 0),
    // 👇 push the *current programme id* here
    programme_ids: [this.data.currentData.degree_programme_id],
    programme_names: [this.data.currentData.degree_programme_name_e]
  }));
}


  // Divide by programme groups for type 2 or 3
  divideByProgramme() {
    if (!this.divisionParts || !this.getStudentCount?.length) {
      this.divisionResult = [];
      return;
    }

    const data = this.getStudentCount;
    const total = this.studentTotalCount;
    const parts = this.divisionParts;
    const target = Math.round(total / parts);

    let groups: any[] = [];
    let currentGroup: any = { total_students: 0, programme_ids: [], programme_names: [] };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      currentGroup.total_students += row.student_count;
      currentGroup.programme_ids.push(row.degree_programme_id);
      currentGroup.programme_names.push(row.Degree_programme_name_e);

      const next = data[i + 1]?.student_count;
      if (
        groups.length < parts - 1 &&
        next !== undefined &&
        Math.abs((currentGroup.total_students + next) - target) > Math.abs(currentGroup.total_students - target)
      ) {
        groups.push(currentGroup);
        currentGroup = { total_students: 0, programme_ids: [], programme_names: [] };
      }
    }

    if (currentGroup.total_students > 0 || currentGroup.programme_ids.length > 0) {
      groups.push(currentGroup);
    }

    while (groups.length < parts) {
      groups.push({ total_students: 0, programme_ids: [], programme_names: [] });
    }

    this.divisionResult = groups;
  }


  getDivisionPayload() {
  const payload: { degree_programme_id: number; section_id: number; allotment_detail_id: number | null }[] = [];

  this.divisionResult.forEach((group: any, index: number) => {
    const groupNumber = index + 1;

    group.programme_ids.forEach((id: number) => {
      payload.push({
        degree_programme_id: id,
        section_id: groupNumber,
        allotment_detail_id: this.selectedAllotmentDetailId  || null// ✅ use stored ID
      });
    });
  });

  return payload;
}


 SubmitStudentSection(){
    const payload = this.getDivisionPayload();
    console.log('Division Payload:', payload);    
      this.HTTP.postData('/course/post/saveStudentSectionAllotment', payload, 'academic')
    .subscribe(res => {
      if (!res.body.error) {
        this.alert.alertMessage("Record Inserted...!", "", "success");
      } else {
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    });
 }

 onCourseSelect(allotmentDetailId: number) {
  this.selectedAllotmentDetailId = allotmentDetailId;
  this.showSectionAllotment = true;
  this.divisionResult = []
  this.divisionParts = null;
  console.log("Selected Course allotment_detail_id:", allotmentDetailId);
}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
