import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'shared';


@Component({
  selector: 'app-update-course-type',
  standalone: false,
  templateUrl: './update-course-type.component.html',
  styleUrl: './update-course-type.component.scss'
})
export class UpdateCourseTypeComponent implements OnInit {

  courseTypeForm!: FormGroup;
  
  // Dropdown Data
  academicSessions: any[] = [];
  degreeProgrammeTypes: any[] = [];
  colleges: any[] = [];
  facultyTypes: any[] = [];
  degreeProgrammes: any[] = [];
  subjects: any[] = [];
  courseYears: any[] = [];
  courseSemesters: any[] = [];
  courseTypes:any[]=[];
  // Table Data
  allotmentData: any[] = [];
  
  // Update Fields
 updateType!: number | null;

  selectedCourseType!: string | null;
  updateReason: string = '';
  
  // Course Types for dropdown
  // courseTypes = [
  //   { value: 'Major', label: 'Major' },
  //   { value: 'Minor', label: 'Minor' },
    
  // ];

  constructor(
    private fb: FormBuilder, 
    private HTTP: HttpService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdownData();
  }

  buildForm() {
    this.courseTypeForm = this.fb.group({
      academicSession: ['', Validators.required],
      
      collegeName: ['', Validators.required],
      
      degreeProgramme: ['', Validators.required],
      
      courseYear: ['', Validators.required],
      courseSemester: ['', Validators.required],
     
    });
  }

  loadDropdownData() {
    // Load Academic Sessions
    this.HTTP.getParam('/master/get/getAcademicSession1/', {}, 'academic')
      .subscribe((result: any) => {
        this.academicSessions = result.body?.data || [];
        console.log(result);
        
      });

    // Load Semesters
    this.HTTP.getParam('/master/get/getSemesterList/', {}, 'academic')
      .subscribe((result: any) => {
        this.courseSemesters = result.body?.data || [];
      });



//college name
this.HTTP.getParam('/master/get/getCollegeList/', {}, 'academic')
      .subscribe((result: any) => {
        this.colleges = result.body?.data || [];
      });

  

//degree program
this.HTTP.getParam('/master/get/getDegreePrograamList/', {}, 'academic')
.subscribe((result: any) => {
  this.degreeProgrammes = result.body?.data || [];
});



      //get course year
      this.HTTP.getParam('/master/get/getCourseYearList/', {}, 'academic')
      .subscribe((result: any) => {
        this.courseYears = result.body?.data || [];
        console.log(result);
        
      });

      //get semester
      this.HTTP.getParam('/master/get/getSemesterList/', {}, 'academic')
      .subscribe((result: any) => {
        this.courseSemesters = result.body?.data || [];
        console.log(result);
        
      });
//cousre type
 this.HTTP.getParam('/master/get/getCourseTypeList/', {}, 'academic')
      .subscribe((result: any) => {
        this.courseTypes = result.body?.data || [];
        console.log(result);
        
      });
  }

  showAllotment() {
    if (this.courseTypeForm.invalid) {
      this.courseTypeForm.markAllAsTouched();
      return;
    }

    const formData = this.courseTypeForm.value;
    
    const params = {
      academic_session_id: formData.academicSession,
      
      college_id: formData.collegeName,
    
      degree_programme_id: formData.degreeProgramme,
     
      course_year_id: formData.courseYear,
      semester_id: formData.courseSemester
    };

    console.log('Show Allotment Params:', params);

    // Replace with your actual API endpoint
    this.HTTP.getParam('/course/get/getUpdateCourseTypeData', params, 'academic')
      .subscribe((result: any) => {
        this.allotmentData = result?.body?.data || [];
         this.updateType = null;
      this.selectedCourseType = null;
      this.updateReason = '';

      /* ----------------------------------------
         3️⃣ CLEAR PREVIOUS SELECTIONS
      ---------------------------------------- */
      this.allotmentData.forEach(row => row.selected = false);

      /* ----------------------------------------
         4️⃣ DEBUG LOGS (TEMPORARY)
      ---------------------------------------- */
      console.log('Allotment Data Loaded:', this.allotmentData);
      console.log('Update state reset');
        console.log('Allotment Data:', this.allotmentData);
      });
      
  }

updateCourseType() {
  console.log('🧪 updateType value:', this.updateType, typeof this.updateType);

  const selectedRows = this.allotmentData.filter(r => r.selected);
  console.log('🧪 Selected Rows:', selectedRows);

  if (!this.selectedCourseType || !this.updateType || !this.updateReason) {
    alert('Please select course type, update type and enter reason.');
    return;
  }


  if (selectedRows.length === 0) {
    alert('Please select at least one course.');
    return;
  }
  const formData = this.courseTypeForm.value;

const payload = {
  academic_session_id: formData.academicSession,
  college_id: formData.collegeName,
 
  degree_programme_id: formData.degreeProgramme,
  course_year_id: formData.courseYear,
  semester_id: formData.courseSemester,
 

  course_type_id: this.selectedCourseType,
  reason: this.updateReason,

  // Use only selected rows
  details: selectedRows.map(c => ({
    course_id: c.course_id,
    allotment_main_id: c.allotment_main_id,
     allotment_detail_id: c.allotment_detail_id,
     student_registration_and_marks_id:c.student_registration_and_marks_id,
      
  }))
};

console.log('📤 Final Payload Sent to API:', payload);


  // Registration Only
// ===============================
// UPDATE TYPE 2 → Registration ONLY
// ===============================
if (this.updateType === 2) {

  this.HTTP.putData(
    '/course/update/updateCourseTypeforReg',
    payload,
    'academic'
  ).subscribe(this.handleUpdateSuccess);

  return;
}

// ==========================================
// UPDATE TYPE 3 → Registration + Allotment
// ==========================================
if (this.updateType === 3) {

  this.HTTP.putData(
    '/course/update/updateCourseTypeforReg',
    payload,
    'academic'
  ).subscribe({
    next: () => {

      this.HTTP.putData(
        '/course/update/updateCourseTypeCourseAndReg',
        payload,
        'academic'
      ).subscribe(this.handleUpdateSuccess);

    },
    error: err => {
      alert(err?.message || 'Registration update failed');
    }
  });

  return;
}

// ===============================
// SAFETY NET (should never hit)
// ===============================
alert('Invalid update type selected.');

}


// ----------------------
// Reusable success handler
// ----------------------
handleUpdateSuccess = (res: any) => {
  if (!res.body?.error) {
    alert('Course Type updated successfully');
    this.showAllotment(); // reload table
  } else {
    alert(res.body.error?.message || 'Update failed');
  }
};

toggleSelectAll(checked: boolean) {
  this.allotmentData.forEach(row => row.selected = checked);
}

get isUpdateDisabled(): boolean {
  return (
    !this.updateType ||
    !this.updateReason?.trim() ||
    !this.selectedCourseType ||
    !this.allotmentData?.some(r => r.selected)
  );
}


}