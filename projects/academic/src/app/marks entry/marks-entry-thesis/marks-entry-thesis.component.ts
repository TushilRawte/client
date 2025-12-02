import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-marks-entry-thesis',
  standalone: false,
  templateUrl: './marks-entry-thesis.component.html',
  styleUrl: './marks-entry-thesis.component.scss'
})
export class MarksEntryThesisComponent implements OnInit{

  marksEntryFacultyFormGroup!:FormGroup
  showEmpIdField: boolean =false
  acadmcSesnList: any;
  degreeProgrammeTypeList: any;
  semesterList: any;
  courseList:any;
  attandanceList:any
  valuationTypeList:any
  examTypeList:any
  remarkList: any;
  getExamPaperTypeList: any;
  testingList:any
  getParticularExamPaperType: any;
  is_insert_in_marks_entry_detail: boolean = false;
  is_update_in_registration_marks: boolean = false;
  is_insert_club_in_marks_entry_detail: boolean = false;
  notShowInternal: boolean = false;
  examPaperTypenameSelected: any;
  collegeList: any;
  degreeProgramme: any;
  selectedDegreeProTypeId: any;
  yearList: any;
  selectedCourse:any

  constructor(private fb: FormBuilder,private HTTP :HttpService, private alert: AlertService,){ }

  ngOnInit(): void {
        this.showEmpIdField = this.hasAllowedDesignation([327, 342, 2423]);
        this.marksEntryAdmin();
        this.getAcademicSession();
        this.getSemester();
        this.getDegreeProgrammeTypeData();
        this.getValuationType();
        this.getExamType();
        this.getRemark();
        this.getExamPaperType();
        this.getCollegeData();
        this.getYearData();
  }

  user: any = {
    emp_id: 100001,
    designation_arr: [327],
  };

    hasAllowedDesignation(allowed: number[]): boolean {
    return allowed.some(id => this.user?.designation_arr?.includes(id));
  }

  marksEntryAdmin() {
  this.marksEntryFacultyFormGroup = this.fb.group({
    emp_id: [this.user.emp_id, Validators.required],
    academic_session_id: ['', Validators.required],
    degree_programme_type_id: ['', Validators.required],
    semester_id: ['', Validators.required],
    valuation_type_id: ['', Validators.required],
    exam_type_id: ['', Validators.required],
    exam_paper_type_id: ['', Validators.required],
    college_id:[''],
    course_year_id: [''],
    degree_programme_id:[''],
    course_nature_id: [''],
    course_id: [''],

    // Bulk student data
    students: this.fb.array([])   // <--- FormArray for rows
  });
}

// Easy getter for students array
get students(): FormArray {
  return this.marksEntryFacultyFormGroup.get('students') as FormArray;
}

populateStudents(attandanceList: any, selectedCourse: any) {
  this.students.clear();
  attandanceList.forEach((item: any) => {
     const formattedDate = item.date_of_viva 
      ? this.formatDate(item.date_of_viva)
      : null;
    const studentForm = this.fb.group({
      ue_id: [item.ue_id],
      student_name: [item.student_name],
      remark_id: [item.thesis_remark_id ?? null],
      final_remark_id: [item.thesis_remark_id ?? null],
      registration_id: [item.registration_id],
      college_id: [item.college_id],
      course_id: [selectedCourse.course_id],
      dean_committee_id: [selectedCourse.dean_committee_id],
      course_year_id: [selectedCourse.course_year_id],
      date_of_viva: [formattedDate ?? null],
      thesis_title: [item.thesis_title ?? null],
      // marks_finalize: [item.thesis_marks_finalize === 1],
      


      // attach from parent form
      academic_session_id: this.marksEntryFacultyFormGroup.get('academic_session_id')?.value,
      semester_id: this.marksEntryFacultyFormGroup.get('semester_id')?.value,
      exam_paper_type_id: this.marksEntryFacultyFormGroup.get('exam_paper_type_id')?.value,
      course_nature_id: this.marksEntryFacultyFormGroup.get('course_nature_id')?.value,
      exam_type_id: this.marksEntryFacultyFormGroup.get('exam_type_id')?.value,
      valuation_type_id: this.marksEntryFacultyFormGroup.get('valuation_type_id')?.value,
    });


    // Conditional enable/disable of fields based on remark_id
    const toggleFields = (remarkId: any) => {
      if (remarkId == 7) {
        studentForm.get('date_of_viva')?.enable();
        studentForm.get('thesis_title')?.enable();
      } else {
        studentForm.get('date_of_viva')?.disable();
        studentForm.get('thesis_title')?.disable();
      }
    };
    
    toggleFields(item.thesis_remark_id);
    studentForm.get('remark_id')?.valueChanges.subscribe(val => {
      toggleFields(val);
    });

    if (Number(item.thesis_marks_finalize) === 1) {
      // studentForm.get('remark_id')?.disable();
      studentForm.get('date_of_viva')?.disable();
      studentForm.get('thesis_title')?.disable();
    }
     
    if (item.thesis_marks_finalize === 1) {
      // studentForm.disable();
    }

    this.students.push(studentForm);
    // Auto calculate totals
    studentForm.get('int_obtained_mark')?.valueChanges.subscribe(() => {
      this.updateTotal(studentForm);
    });
    studentForm.get('ext_obtained_mark')?.valueChanges.subscribe(() => {
      this.updateTotal(studentForm);
    });
  });
}


// club internal and external marks
updateTotal(studentForm: FormGroup) {
  const intMarks = +studentForm.get('int_obtained_mark')?.value || 0;
  const extMarks = +studentForm.get('ext_obtained_mark')?.value || 0;
  studentForm.get('total_obtained_marks')?.setValue(intMarks + extMarks, { emitEvent: false });
}

    getAcademicSession(){
      this.HTTP.getParam('/master/get/getAcademicSession1/', {}, 'academic').subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data;
    });
  }

  // ~ ng init load degree programm type
  getDegreeProgrammeTypeData(){
    this.HTTP.getParam( '/master/get/getDegreeProgramType/',{},'academic').subscribe((result: any) => {
      this.degreeProgrammeTypeList = result?.body?.data;
    });
  }

  getSemester(){
    this.HTTP.getParam('/master/get/getSemesterList/', {},'academic').subscribe((result: any) => {
      this.semesterList = result.body.data;
    });
  }
    getValuationType(){
    this.HTTP.getParam('/master/get/getValuationType/', {},'academic').subscribe((result: any) => {
      this.valuationTypeList = result.body.data;
    });
  }

  getExamType(){
    this.HTTP.getParam('/master/get/getExamType/', {},'academic').subscribe((result: any) => {
      this.examTypeList = result.body.data;
    });
  }

  getRemark() {
    this.HTTP.getParam('/master/get/getRemark/',{} ,'academic').subscribe((result:any) => {
      this.remarkList = result.body.data;
      console.log(this.remarkList, 'remark');
      
    })
  }

    getExamPaperType() {
    this.HTTP.getParam('/master/get/getExamPaperType/',{} ,'academic').subscribe((result:any) => {
      this.getExamPaperTypeList = result.body.data;
    })
  }

    getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList1/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.collegeList = result.body.data;
    })
  }

    getYearData() {
    this.HTTP.getParam('/master/get/getCourseYearList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.yearList = result.body.data;
    })
  }

    onCollegeChange(college_id: number) {
  // console.log('Selected College ID:', college_id);
  this.getDegreeProgramme(college_id); 
  // this.courseAllotFormGroup.get('degree_programme_id')?.reset();
  // this.courseYearList = [];
 }

 getDegreeProgramme(college_id: number) {
  this.HTTP.getParam('/master/get/getDegreePrograamList/', { college_id }, 'academic')
    .subscribe((result: any) => {
      this.degreeProgramme = result.body.data;
      console.log('Initial Degree Programme:', this.degreeProgramme);

      // Add hardcoded objects only if college_id = 5
      if (college_id === 5) {
        const extraProgrammes = [
          {
            degree_programme_id: 14,
            degree_programme_name_e: "M.Sc.(Ag.) (PGS)",
            degree_id: 12,
            subject_id: 139
          },
          {
            degree_programme_id: 37,
            degree_programme_name_e: "Ph.D in Agriculture (PGS)",
            degree_id: 5,
            subject_id: 139
          }
        ];

        // Push into array
        this.degreeProgramme.push(...extraProgrammes);
      }

      console.log('Final Degree Programme:', this.degreeProgramme);
    });
}

  onDegreeProgrammeChange(degree_programme_id: number) {
    const selected = this.degreeProgramme.find((p: { degree_programme_id: number; }) => p.degree_programme_id === degree_programme_id);
    const degree_id = selected?.degree_id;
    const subject_id = selected?.subject_id;
    this.selectedDegreeProTypeId = selected?.degree_programme_type_id;
  if (this.marksEntryFacultyFormGroup) {
    this.marksEntryFacultyFormGroup.patchValue({
      degree_programme_type_id: this.selectedDegreeProTypeId,
      degree_programme_id: degree_programme_id
    });
  }

  }

  getExamWiseExamPaperType(selectedCourse:any){
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      degree_programme_type_id : formValue.degree_programme_type_id,
      exam_type_id : formValue.exam_type_id,
      exam_paper_type_id: formValue.exam_paper_type_id,
      valuation_type_id: formValue.valuation_type_id,
      dean_committee_id:selectedCourse.dean_committee_id,
      credit_nature_id:selectedCourse.credit_nature_id,
      getRemarks:true

    }
      this.HTTP.getParam('/attendance/get/getExamWiseExamPaperType/',params ,'academic').subscribe((result:any) => {
        const data = result.body.data 
      this.getParticularExamPaperType = result.body.data[0]?.club_with_exam_paper_type_id;
      this.is_insert_in_marks_entry_detail = (result.body.data[0]?.is_insert_in_marks_entry_detail === 'Y');
      this.is_update_in_registration_marks = (result.body.data[0]?.is_update_in_registration_marks === 'Y');
      this.is_insert_club_in_marks_entry_detail = (result.body.data[0]?.is_insert_club_in_marks_entry_detail === 'Y');
      // this.remarkList=result.body.data
        // ✅ If exam paper type API gives remark list, use it, else fallback
    //    if (Array.isArray(data) && data.length > 0) {
    //   this.remarkList = data;
    // } else {            
    //   this.getRemark(); // fallback to master remarks
    // }
      console.log(this.getParticularExamPaperType);
        this.getStudentList(selectedCourse,this.getParticularExamPaperType)
    })
  }

  onExamPaperTypeChange(selected: any) {
  this.marksEntryFacultyFormGroup.patchValue({
    exam_paper_type_id: selected.exam_paper_type_id,
    course_nature_id: selected.course_nature_id   // <-- set course nature here
  });
   this.examPaperTypenameSelected = selected.exam_paper_type_name_e;
   // Show/hide internal marks based on paper type
   if(selected.exam_paper_type_id === 9 ){
    this.notShowInternal=true
   }
   else{
    this.notShowInternal=false
   }
}

  getCourseList(){
    if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      // emp_id:formValue.emp_id,
      academic_session_id : formValue.academic_session_id,
      semester_id : formValue.semester_id,
      degree_programme_type_id : formValue.degree_programme_type_id,
      exam_type_id:formValue.exam_type_id,
      college_id:formValue.college_id,
      course_year_id:formValue.course_year_id,
      exam_paper_type_id:formValue.exam_paper_type_id,
    }

 this.HTTP.getParam('/attendance/get/getCourseForMannualMarksEntry/', params, 'academic').subscribe((res: any) => {
  if (!res.body.error) {
    if (res.body.data && res.body.data.length > 0) {
      this.courseList = res.body.data;
      console.log(res.body.data);
    } else {
      this.alert.alertMessage("No Data Found...!", "", "warning");
       this.courseList = []
    }
  } else {
    this.alert.alertMessage("Something Went Wrong...!", "", "warning");
  }
});
}

  getCourseListParticularData(item:any){
  this.getExamWiseExamPaperType(item)
  }

  getStudentList(selectedCourse:any,getParticularExamPaperType:any){
    this.selectedCourse = selectedCourse
     if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      // emp_id:formValue.emp_id,
      academic_session_id : formValue.academic_session_id,
      semester_id : formValue.semester_id,
      degree_programme_type_id : formValue.degree_programme_type_id,
      college_id:selectedCourse.college_id,
      course_nature_id :formValue.course_nature_id,
      course_id:selectedCourse.course_id,
      course_registration_type_id:1,
      exam_type_id : formValue.exam_type_id,
      course_semester_id : formValue.semester_id,
      exam_paper_type_id_int :getParticularExamPaperType ?? formValue.exam_paper_type_id,
      exam_paper_type_id_ext: formValue.exam_paper_type_id

    }
    this.HTTP.getParam('/attendance/get/getStudentListforMarksEntry/',params,'academic').subscribe((res:any) => {
       if (!res.body.error) {
         this.attandanceList = res.body.data;
         console.log(res.body.data);
        this.populateStudents(this.attandanceList,selectedCourse)
       }
       else{
         this.alert.alertMessage("Something Went Wrong...!", "", "warnig");
       }
    })
  }

// search students by ue_id
courseID: string = '';

get filteredCourse() {
  if (!this.courseID) return this.courseList;
  return this.courseList.filter((s: { value: { course_code: { toString: () => string; }; }; }) =>
    s.value.course_code?.toString().toLowerCase().includes(this.courseID.toLowerCase())
  );
}

// search students by ue_id
searchUeId: string = '';

get filteredStudents() {
  if (!this.searchUeId) return this.students.controls;
  return this.students.controls.filter(s =>
    s.value.ue_id?.toString().toLowerCase().includes(this.searchUeId.toLowerCase())
  );
}
  



onSubmit() {
  // Get only new or modified student rows
  const payload = this.students.controls
    .filter(ctrl => ctrl.dirty || !ctrl.get('ue_id')?.value)
    .map(ctrl => {
      const val = ctrl.value;

      // Clean empty date fields to avoid DB error
      const cleanedDate = val.date_of_viva ? val.date_of_viva : null;

      return {
        ...val,
        date_of_viva: cleanedDate,
        // Convert marks_finalize boolean → numeric if needed
        // marks_finalize: val.marks_finalize ? 1 : 4
      };
    });

  if (payload.length === 0) {
    this.alert.alertMessage('No changes to save!', '', 'info');
    return;
  }

  console.log('Final Payload:', payload);

  const apiUrl = '/attendance/update/saveStudentMarkEntryThesis/';
  this.HTTP.putData(apiUrl, payload, 'academic').subscribe(res => {
    if (!res.body.error) {
      this.alert.alertMessage("Record Inserted!", "", "success");
      this.refreshStudentList();
      this.marksEntryFacultyFormGroup.markAsPristine();
    } else {
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
    }
  });
}





onFinalize() {
  // Get all student rows (no dirty check)
  const payload = this.students.controls.map(ctrl => {
    const val = ctrl.value;
    return {
      ...val,
      marks_finalize: 1   // 🔹 Force finalize flag
    };
  });

  console.log('Finalize Payload:', payload);

  const apiUrl = '/attendance/update/updateMarksFinalizethesis/';
  this.HTTP.putData(apiUrl, payload, 'academic').subscribe(res => {
    if (!res.body.error) {
      this.alert.alertMessage("Marks Finalized Successfully!", "", "success");
      this.refreshStudentList();
      // Optional: disable editing after finalize
    } else {
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
    }
  });
}



  // Refresh student list
  refreshStudentList() {
    if (this.selectedCourse) {
      this.getExamWiseExamPaperType(this.selectedCourse);
    } else {
      this.alert.alertMessage("Info", "No course selected to refresh.", "info");
    }
  }

  formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}



}