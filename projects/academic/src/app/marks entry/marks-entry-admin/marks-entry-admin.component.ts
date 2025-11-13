import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
@Component({
  selector: 'app-marks-entry-admin',
  standalone: false,
  templateUrl: './marks-entry-admin.component.html',
  styleUrl: './marks-entry-admin.component.scss'
})
export class MarksEntryAdminComponent implements OnInit{

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
        // this.getAcademicSession();
        // this.getSemester();
        this.getDegreeProgrammeTypeData();
        // this.getValuationType();
        // this.getExamType();
        this.getRemark();
        // this.getExamPaperType();
        // this.getCollegeData();
        // this.getYearData();
        this.marksEntryFacultyFormGroup.get('valuation_type_id')?.valueChanges.subscribe(value => {
  // force re-render when valuation type changes
  this.students.updateValueAndValidity();
});


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
    const valuationTypeId = this.marksEntryFacultyFormGroup.get('valuation_type_id')?.value;
    let finalizeField = '';
     let remarkField = '';
     let finalRemarkField = '';
     let markField = '';
    // if (valuationTypeId === 1) finalizeField = 'ext_marks_finalize';
    // else if (valuationTypeId === 2) finalizeField = 'reval_marks_finalize';
    // else if (valuationTypeId === 3) finalizeField = 're_reval_marks_finalize';

     if (valuationTypeId === 1) {
    finalizeField = 'ext_marks_finalize';
    remarkField = 'ext_remark_id';
    finalRemarkField = 'ext_special_remark_id';
     markField = 'ext_obtained_mark';
  } else if (valuationTypeId === 2 || 4 || 7 || 8 || 9) {
    finalizeField = 'reval_marks_finalize';
    remarkField = 'reval_remark_id';
    finalRemarkField = 'reval_special_remark_id';
    markField = 'reval_obtained_mark';
  } else if (valuationTypeId === 3) {
    finalizeField = 're_reval_marks_finalize';
    remarkField = 're_reval_intered_remark_id';
    finalRemarkField = 're_reval_intered_special_remark_id';
    markField = 'r_reval_obtained_mark';
  }

  attandanceList.forEach((item: any) => {

    //set status
    const intImported = item.int_obtained_mark !== null && item.int_obtained_mark !== undefined && item.int_obtained_mark !== '';
    const extImported = item.ext_obtained_mark !== null && item.ext_obtained_mark !== undefined && item.ext_obtained_mark !== '';
    const intFinalized = Number(item.int_marks_finalize) === 1;
    const extFinalized = Number(item.ext_marks_finalize) === 1;
    const remarkId = item[remarkField] ?? '';
    const finalRemarkId = item[finalRemarkField] ?? '';
    const activeFinalizeValue = Number(item[finalizeField]) === 1;
    const finalizeStatus = Number(item[finalizeField]) === 1;

    
    const studentForm = this.fb.group({
      ue_id: [item.ue_id],
      student_name: [item.student_name],
      r_reval_avg_obtained_mark: [item.r_reval_avg_obtained_mark],
      int_obtained_mark: [item.int_obtained_mark ?? 0, [Validators.min(0)]],
      ext_obtained_mark: [item.ext_obtained_mark ?? 0, [Validators.min(0)]],
      reval_obtained_mark: [item.reval_obtained_mark ?? 0, [Validators.min(0)]],
      // r_reval_obtained_mark: [0,[Validators.min(0)]],
      r_reval_obtained_mark: [item.r_reval_intered_obtained_mark ?? 0, [Validators.min(0)]],
      finalizeField: item[finalizeField],
      marks_finalize: [activeFinalizeValue],
      finalizeStatus: [finalizeStatus],

      
      total_obtained_marks:
     valuationTypeId === 1
    ? (item.int_obtained_mark ?? 0) + (item.ext_obtained_mark ?? 0)
    : valuationTypeId === 2 || 4 || 5 || 7 || 8 || 9
    ? (item.int_obtained_mark ?? 0) + (item.reval_obtained_mark ?? 0)
    : valuationTypeId === 3
    ? (item.int_obtained_mark ?? 0) + (item.r_reval_avg_obtained_mark ?? 0)
    : (item.int_obtained_mark ?? 0) + (item.ext_obtained_mark ?? 0),

      // remark_id: [item.ext_remark_id ?? ''],
      remark_id: [remarkId],
      final_remark_id: [finalRemarkId],
      registration_id: [item.registration_id],
      college_id: [item.college_id],
      course_id: [selectedCourse.course_id],
      dean_committee_id: [selectedCourse.dean_committee_id],
      course_year_id: [selectedCourse.course_year_id],
      max_marks_internal: [item.max_marks_internal],
      max_marks_external: [item.max_marks_external],
      total_marks: [item.max_marks_internal + item.max_marks_external],
      final_marks: [item.final_marks ?? ''],

      // attach from parent form
      academic_session_id: this.marksEntryFacultyFormGroup.get('academic_session_id')?.value,
      semester_id: this.marksEntryFacultyFormGroup.get('semester_id')?.value,
      exam_paper_type_id: this.marksEntryFacultyFormGroup.get('exam_paper_type_id')?.value,
      course_nature_id: this.marksEntryFacultyFormGroup.get('course_nature_id')?.value,
      exam_type_id: this.marksEntryFacultyFormGroup.get('exam_type_id')?.value,
      valuation_type_id: this.marksEntryFacultyFormGroup.get('valuation_type_id')?.value,

      intImported: [ intImported ],
      extImported: [ extImported ],
      intFinalized: [ intFinalized ],
      extFinalized: [ extFinalized ],
      

      ext_marks_finalize: [ item.ext_marks_finalize ?? null ],
       re_reval_intered_marks_finalize: [ item.re_reval_intered_marks_finalize ?? null ],
        reval_marks_finalize: [ item.reval_marks_finalize ?? null ],
        //  marks_finalize: [item.ext_marks_finalize === '1'], // boolean for checkbox
      
      
      _original: this.fb.group({   // store original values to detect changes
        int_obtained_mark: [item.int_obtained_mark ?? ''],
        ext_obtained_mark: [item.ext_obtained_mark ?? ''],
        remark_id: [item.ext_remark_id ?? ''],
        final_remark_id: [item.ext_remark_id ?? ''],
         reval_obtained_mark: [item.reval_obtained_mark ?? ''],
        r_reval_obtained_mark: [item.r_reval_intered_obtained_mark ?? ''],

      })
    });

      // console.log(item[finalizeField], 'finalizeField');
      
     if (Number(item.ext_marks_finalize) === 1) {
      // studentForm.get('ext_obtained_mark')?.disable();
      // studentForm.get('remark_id')?.disable();
      // studentForm.get('final_remark_id')?.disable();
    }


    // if (item.ext_marks_finalize === "") {
    //   studentForm.disable();
    // }

    this.students.push(studentForm);

    // Auto calculate totals
    studentForm.get('int_obtained_mark')?.valueChanges.subscribe(() => {
      this.updateTotal(studentForm);
    });

 studentForm.get(markField)?.valueChanges.subscribe((newValue) => {
  this.updateTotal(studentForm);

  const prevValue = Number(studentForm.get(`_original.${markField}`)?.value ?? 0);
  const currentValue = Number(newValue ?? 0);

  // 🔥 Auto-update remark_id & final_remark_id based on rule
  if (prevValue > 0 && currentValue === 0) {
    studentForm.get('remark_id')?.setValue(15); // mark removed
    studentForm.get('final_remark_id')?.setValue(15);
  } else if (prevValue === 0 && currentValue > 0) {
    studentForm.get('remark_id')?.setValue(14); // mark added
    studentForm.get('final_remark_id')?.setValue(14);
  }

  // update original for next comparison
  const originalGroup = studentForm.get('_original') as FormGroup | null;
  const originalControl = originalGroup?.get(markField);
  originalControl?.setValue(currentValue);
});
    

  });
}


// club internal and external marks
updateTotal(studentForm: FormGroup) {
  const intMarks = +studentForm.get('int_obtained_mark')?.value || 0;
  // pick current valuation type active mark (read from parent form)
  const valuationTypeId = Number(this.marksEntryFacultyFormGroup.get('valuation_type_id')?.value);
  let activeMark = 0;
  if (valuationTypeId === 1) {
    activeMark = +studentForm.get('ext_obtained_mark')?.value || 0;
  } else if (valuationTypeId === 2 || 4 || 7 || 8 || 9) {
    activeMark = +studentForm.get('reval_obtained_mark')?.value || 0;
  } else if (valuationTypeId === 3) {
    // use average field when available, otherwise the r_reval control
    activeMark = +studentForm.get('re_reval_intered_mark  ')?.value
      || +studentForm.get('r_reval_obtained_mark')?.value
      || 0;
  } else {
    activeMark = +studentForm.get('ext_obtained_mark')?.value || 0;
  }
  studentForm.get('total_obtained_marks')?.setValue(intMarks + activeMark, { emitEvent: false });
}


  // ~ ng init load degree programm type
  getDegreeProgrammeTypeData(){
    this.HTTP.getParam( '/master/get/getDegreeProgramType/',{},'academic').subscribe((result: any) => {
      this.degreeProgrammeTypeList = result?.body?.data;
    });
  }

  getRemark() {
    this.HTTP.getParam('/master/get/getRemark/',{} ,'academic').subscribe((result:any) => {
      this.remarkList = result.body.data;
    })
  }

onDegreeProgrammeChange(selected: any) {
  if (!selected) return;
  console.log(selected);
  console.log('i am called');
  
  this.selectedDegreeProTypeId = selected.degree_programme_type_id;
  this.marksEntryFacultyFormGroup.patchValue({
    degree_programme_id: selected.degree_programme_id,
    degree_programme_type_id: this.selectedDegreeProTypeId
  });
}

onValuationTypeChange(select:any){

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
       if (Array.isArray(data) && data.length > 0) {
      this.remarkList = data;
    } else {
      this.getRemark(); // fallback to master remarks
    }
      console.log(this.getParticularExamPaperType);
        // this.getStudentList(selectedCourse,this.getParticularExamPaperType)
        // this.getRevalStudentList(selectedCourse,this.getParticularExamPaperType)
         // ✅ Conditional API call
    if (formValue.valuation_type_id) {
  const valuationType = Number(formValue.valuation_type_id);

  if (valuationType === 1) {
    console.log("✅ Calling Normal Student List...");
    this.getStudentList(selectedCourse, this.getParticularExamPaperType);
  } 
  else if (valuationType === 2 || valuationType === 4 || valuationType === 5 || valuationType === 7 || valuationType === 8 || valuationType === 9) {
    console.log("🔁 Calling Revaluation Student List...");
    this.getRevalStudentList(selectedCourse, this.getParticularExamPaperType);
  } 
  else if (valuationType === 3) {
    console.log("🔂 Calling Re-Revaluation Student List...");
    this.getRe_RevalStudentList(selectedCourse, this.getParticularExamPaperType);
  }
}

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

getCourseList() {
  console.log(this.marksEntryFacultyFormGroup.value);
  this.clearStudentTable()
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }

  const formValue = this.marksEntryFacultyFormGroup.value;

  // Common parameters
  const params: any = {
    academic_session_id: formValue.academic_session_id,
    semester_id: formValue.semester_id,
    degree_programme_type_id: formValue.degree_programme_type_id,
    exam_type_id: formValue.exam_type_id,
    college_id: formValue.college_id,
    course_year_id: formValue.course_year_id,
    exam_paper_type_id: formValue.exam_paper_type_id,
  };

  // ✅ If valuation_type_id is NOT 1 → include revaluation_type_id
  // if (formValue.valuation_type_id && formValue.valuation_type_id != 1) {
  //   params.revaluation_type_id = formValue.valuation_type_id;
  // }

  if (formValue.valuation_type_id && formValue.valuation_type_id != 1) {
  // If 3 → send 2 instead for only re-reval and if reval than default 2 and if 1 than no need to send
  params.revaluation_type_id = formValue.valuation_type_id === 3 ? 2 : formValue.valuation_type_id;
}
  // Same API call (no need for two separate methods)
  this.HTTP.getParam('/attendance/get/getCourseForMannualMarksEntry/', params, 'academic').subscribe((res: any) => {
    if (!res.body.error) {
      if (res.body.data && res.body.data.length > 0) {
        this.courseList = res.body.data;
        // console.log("✅ Course List:", res.body.data);
      } else {
        this.alert.alertMessage("No Data Found...!", "", "warning");
        this.courseList = [];
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
    const params: any = {
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
     // ✅ If valuation_type_id is NOT 1, include revaluation_type_id
  if (formValue.valuation_type_id && formValue.valuation_type_id != 1) {
    params.revaluation_type_id = formValue.valuation_type_id;
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

   getRevalStudentList(selectedCourse:any,getParticularExamPaperType:any){
    this.selectedCourse = selectedCourse
     if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const formValue = this.marksEntryFacultyFormGroup.value
    const params: any = {
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
      exam_paper_type_id_ext: formValue.exam_paper_type_id,
      exam_paper_type_id_rvl:formValue.exam_paper_type_id,
      valuation_type_id:formValue.valuation_type_id,
      
    } 
    this.HTTP.getParam('/attendance/get/getStudentListforRevalMarksEntry/',params,'academic').subscribe((res:any) => {
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

    getRe_RevalStudentList(selectedCourse:any,getParticularExamPaperType:any){
    this.selectedCourse = selectedCourse
     if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    
    const formValue = this.marksEntryFacultyFormGroup.value
     const valuation_type_id =
    Number(formValue.valuation_type_id) === 3 ? 2 : formValue.valuation_type_id;
    const params: any = {
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
      exam_paper_type_id_ext: formValue.exam_paper_type_id,
      exam_paper_type_id_rvl:formValue.exam_paper_type_id,
      exam_paper_type_id_r_rvl:formValue.exam_paper_type_id,
      valuation_type_id:valuation_type_id,
      exam_paper_type_id_r_rvl_avg: formValue.exam_paper_type_id,
      exam_paper_type_id_r_rvl_intered: formValue.exam_paper_type_id,
      
    } 
    this.HTTP.getParam('/attendance/get/getStudentListforRe_RevalMarksEntry/',params,'academic').subscribe((res:any) => {
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
  
onSubmit1() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.marksEntryFacultyFormGroup.markAllAsTouched();
    alert('Please enter marks for all students');
    return;
  }
  const formValue = this.marksEntryFacultyFormGroup.value;
  const payload: any[] = [];

  this.students.controls.forEach((control) => {
    const studentControl = control as FormGroup;  // ✅ Cast explicitly
    const student = studentControl.value;
    const original = student._original;

    const isNew =
      !original.int_obtained_mark &&
      !original.ext_obtained_mark &&
      (student.int_obtained_mark || student.ext_obtained_mark);

    const isChanged =
      student.int_obtained_mark !== original.int_obtained_mark ||
      student.ext_obtained_mark !== original.ext_obtained_mark ||
      student.remark_id !== original.remark_id ||
      student.final_remark_id !== original.final_remark_id ||
      student.marks_finalize !== original.marks_finalize;

    if (isNew || isChanged) {
      payload.push({
        ...student,
        obtained_mark: student.total_obtained_marks,
        marks_finalize: student.marks_finalize ? '1' : '0'
      });
    }
  });

  console.log('Final Payload to Save:', payload);

  if (payload.length === 0) {
    this.alert.alertMessage('No Changes', 'No modified or new rows to save.', 'info');
    return;
  }


}


onSubmit() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }

  const payload: any[] = [];

 this.students.controls.forEach((control) => {
    const studentControl = control as FormGroup;  // ✅ Cast explicitly
    // const student = studentControl.value;
    const student = studentControl.getRawValue()
    const original = student._original;

    // Check if new row (no original data)
    const isNewRow = !original;

    // Compare each relevant field
    const isChanged =
      isNewRow ||
      student.int_obtained_mark !== original.int_obtained_mark ||
      student.ext_obtained_mark !== original.ext_obtained_mark ||
      student.remark_id !== original.remark_id ||
      student.final_remark_id !== original.final_remark_id ||
      student.marks_finalize !== original.marks_finalize;

    if (!isChanged) return; // skip unchanged rows

    // Normalize marks
    const valuationTypeId = Number(this.marksEntryFacultyFormGroup.value.valuation_type_id);
    const intMark = student.int_obtained_mark || 0;
    const extOBtinedMark = student.ext_obtained_mark;
    console.log('extOBtinedMark',extOBtinedMark);
    
    const extMark = valuationTypeId === 1
        ? (student.ext_obtained_mark || 0)
        : (student.reval_obtained_mark || 0);
    const totalMark = intMark + extMark;
    const marksFinalize = student.marks_finalize ? '1' : '0';

  let re_reval_flag = 'F';
  if (student.max_marks_external && student.reval_obtained_mark != null && student.ext_obtained_mark != null) {
    const margin = Math.abs(student.reval_obtained_mark - student.ext_obtained_mark);
    const threshold = student.max_marks_external * 0.2;  // ✅ Correct reference
    if (margin > threshold) {
      re_reval_flag = 'T';
    }
  }

    // === Condition 1: Insert + Update + Club ===
    if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {

    // 🧩 For Valuation Type = 3 → Generate 3 Rows
  if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {

  if (valuationTypeId === 3) {
    const rRevalMark = student.r_reval_obtained_mark || 0;
    const revalMark = student.reval_obtained_mark || 0;
    const avgMark = Math.round((rRevalMark + revalMark) / 2);
    const clubMark = Math.round((student.int_obtained_mark || 0) + avgMark);

    // 1️⃣ Re-Revaluation Row
    payload.push({
      ...student,
      obtained_mark: rRevalMark,
      marks_finalize: marksFinalize,
      re_reval_flag,
    });

    // 2️⃣ Average Row (Rounded)
    payload.push({
      ...student,
      obtained_mark: avgMark,
      marks_finalize: marksFinalize,
      re_reval_flag,
      valuation_type_id:5,
    });

    // 3️⃣ Clubbed Row
    let mappedExamTypeId = student.exam_paper_type_id;
    if (student.exam_paper_type_id === 9) mappedExamTypeId = 1;
    else if (student.exam_paper_type_id === 12) mappedExamTypeId = 2;

    payload.push({
      ...student,
      obtained_mark: clubMark,
      exam_paper_type_id: mappedExamTypeId,
      marks_finalize: marksFinalize,
      re_reval_flag,
      //Valuation type id for Avg
      valuation_type_id:5,  
    });
  }

  // --- 🧩 Valuation Type 1 & 2 ---
  else {
    payload.push({
      ...student,
      obtained_mark: extMark,
      marks_finalize: marksFinalize,
      re_reval_flag
    });

    let mappedExamTypeId = student.exam_paper_type_id;
    if (student.exam_paper_type_id === 9) mappedExamTypeId = 1;
    else if (student.exam_paper_type_id === 12) mappedExamTypeId = 2;

    payload.push({
      ...student,
      obtained_mark: totalMark,
      exam_paper_type_id: mappedExamTypeId,
      marks_finalize: marksFinalize,
      re_reval_flag
    });
  }
}


    }

    // === Condition 2: Insert + Update (No Club) ===
    else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
        re_reval_flag: re_reval_flag
      });
    }

    // === Condition 3: Only Insert ===
    else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: totalMark,
        marks_finalize: marksFinalize,
      });
    }
  });

  if (payload.length === 0) {
    this.alert.alertMessage("No Changes", "No new or modified rows found.", "info");
    return;
  }

  console.log("✅ Final Payload:", payload);
  // Send to correct API (same logic)
  let apiUrl = '';
  if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentsclubedMarks';
  else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentsMarkDirectAndUpdateInReg';
  else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentMarkEntryInternalManually';

  this.HTTP.postData(apiUrl, payload, 'academic').subscribe(res => {
    if (!res.body.error){
            this.alert.alertMessage("Record Inserted!", "", "success");
      this.refreshStudentList()
    }
    else
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
  });
}

onFinalize() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }

  const confirmFinalize = window.confirm("Are you sure you want to finalize marks?");
  if (!confirmFinalize) return;

  const payload: any[] = [];

  this.students.controls.forEach((control) => {
    const studentControl = control as FormGroup;
    const student = studentControl.getRawValue();

    const valuationTypeId = Number(this.marksEntryFacultyFormGroup.value.valuation_type_id);
    const intMark = student.int_obtained_mark || 0;
    const extMark = student.ext_obtained_mark || 0;
    const revalMark = student.reval_obtained_mark || 0;
    const rRevalMark = student.r_reval_obtained_mark || 0;
    const totalMark = intMark + extMark;

    const marksFinalize = student.marks_finalize ? '1' : '0';

    // 🧮 Compute re-revaluation flag
    let re_reval_flag = 'F';
    if (student.max_marks_external && student.reval_obtained_mark != null && student.ext_obtained_mark != null) {
      const margin = Math.abs(student.reval_obtained_mark - student.ext_obtained_mark);
      const threshold = student.max_marks_external * 0.2;
      if (margin > threshold) re_reval_flag = 'T';
    }

    // === Condition 1: Insert + Update + Club ===
    if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {

      // ⚙️ Valuation Type = 3 → Generate 3 rows
      if (valuationTypeId === 3) {
        const avgMark = Math.round((rRevalMark + revalMark) / 2);
        const clubMark = Math.round(intMark + avgMark);

        // 1️⃣ Re-Revaluation Row
        payload.push({
          ...student,
          obtained_mark: rRevalMark,
          marks_finalize: 1,
          re_reval_flag
        });

        // 2️⃣ Average Row (Rounded)
        payload.push({
          ...student,
          obtained_mark: avgMark,
          marks_finalize: 1,
          re_reval_flag,
          valuation_type_id: 5,
        });

        // 3️⃣ Clubbed Row
        let mappedExamTypeId = student.exam_paper_type_id;
        if (student.exam_paper_type_id === 9) mappedExamTypeId = 1;
        else if (student.exam_paper_type_id === 12) mappedExamTypeId = 2;

        payload.push({
          ...student,
          obtained_mark: clubMark,
          exam_paper_type_id: mappedExamTypeId,
          marks_finalize: 1,
          re_reval_flag,
          valuation_type_id: 5
        });
      }

      // ⚙️ For Valuation Type 1 & 2
      else {
        const finalExtMark = valuationTypeId === 1 ? extMark : revalMark;
        const totalForClub = intMark + finalExtMark;

        payload.push({
          ...student,
          obtained_mark: finalExtMark,
          marks_finalize: 1,
          re_reval_flag
        });

        let mappedExamTypeId = student.exam_paper_type_id;
        if (student.exam_paper_type_id === 9) mappedExamTypeId = 1;
        else if (student.exam_paper_type_id === 12) mappedExamTypeId = 2;

        payload.push({
          ...student,
          obtained_mark: totalForClub,
          exam_paper_type_id: mappedExamTypeId,
          marks_finalize: 1,
          re_reval_flag
        });
      }
    }

    // === Condition 2: Insert + Update (No Club) ===
    else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      const obtained = valuationTypeId === 1 ? extMark : revalMark;
      payload.push({
        ...student,
        obtained_mark: obtained,
        marks_finalize: 1,
        re_reval_flag
      });
    }

    // === Condition 3: Only Insert ===
    else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: totalMark,
        marks_finalize: 1,
        re_reval_flag
      });
    }
  });

  if (payload.length === 0) {
    this.alert.alertMessage("No Data", "Nothing to finalize.", "info");
    return;
  }

  console.log("✅ Finalize Payload:", payload);

  // 🔗 Select correct API endpoint
  let apiUrl = '';
  if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/update/updateMarksFinalizeWithClub';
  else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/update/updateMarksFinalizeWithClub';
  else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/update/updateMarksFinalizeInternal';

  // Uncomment to send request
  this.HTTP.putData(apiUrl, payload, 'academic').subscribe(res => {
    if (!res.body.error) {
      this.alert.alertMessage("Marks Finalized!", "", "success");
      this.refreshStudentList();
    } else {
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
    }
  });
}

// onFinalize() {
//   if (this.marksEntryFacultyFormGroup.invalid) {
//     this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
//     return;
//   }

//   const confirmFinalize = window.confirm("Are you sure you want to finalize marks?");
//   if (!confirmFinalize) return; // ❌ stop if user cancels

//   const payload: any[] = [];

//   this.students.controls.forEach((control) => {
//     const studentControl = control as FormGroup;
//     const student = studentControl.value;
//     const original = student._original;

//     // --- skip change detection or dirty check (as per your request) ---
//     const intMark = student.int_obtained_mark || 0;
//     const extMark = student.ext_obtained_mark || 0;
//     const totalMark = intMark + extMark;
//     const marksFinalize = student.marks_finalize ? 1 : 0;

//     // === Condition 1: Insert + Update + Club ===
//     if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {
//       payload.push({
//         ...student,
//         obtained_mark: extMark,
//         marks_finalize: marksFinalize,
//       });

//       let mappedExamTypeId = student.exam_paper_type_id;
//       if (student.exam_paper_type_id === 9) mappedExamTypeId = 1;
//       else if (student.exam_paper_type_id === 12) mappedExamTypeId = 2;

//       payload.push({
//         ...student,
//         obtained_mark: totalMark,
//         exam_paper_type_id: mappedExamTypeId,
//         marks_finalize: marksFinalize,
//       });
//     }

//     // === Condition 2: Insert + Update (No Club) ===
//     else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
//       payload.push({
//         ...student,
//         obtained_mark: extMark,
//         marks_finalize: marksFinalize,
//       });
//     }

//     // === Condition 3: Only Insert ===
//     else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
//       payload.push({
//         ...student,
//         obtained_mark: totalMark,
//         marks_finalize: marksFinalize,
//       });
//     }
//   });

//   if (payload.length === 0) {
//     this.alert.alertMessage("No Data", "Nothing to finalize.", "info");
//     return;
//   }

//   console.log("✅ Final Payload:", payload);

//   let apiUrl = '';
//   if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail)
//     apiUrl = '/attendance/update/updateMarksFinalizeWithClub';
//   else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
//     apiUrl = '/attendance/update/updateMarksFinalizeWithClub';
//   else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
//     apiUrl = '/attendance/update/updateMarksFinalizeInternal';

//   // this.HTTP.putData(apiUrl, payload, 'academic').subscribe(res => {
//   //   if (!res.body.error){
//   //           this.alert.alertMessage("Marks Finalized!", "", "success");
//   //           this.refreshStudentList()
//   //   }
//   //   else
//   //     this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
//   // });
// }

  // Refresh student list
  refreshStudentList() {
    if (this.selectedCourse) {
      this.getExamWiseExamPaperType(this.selectedCourse);
    } else {
      this.alert.alertMessage("Info", "No course selected to refresh.", "info");
    }
  }

//main 30-10-25
onSubmit2() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }

  const payload: any[] = [];

 this.students.controls.forEach((control) => {
    const studentControl = control as FormGroup;  // ✅ Cast explicitly
    const student = studentControl.value;
    const original = student._original;

    // Check if new row (no original data)
    const isNewRow = !original;

    // Compare each relevant field
    const isChanged =
      isNewRow ||
      student.int_obtained_mark !== original.int_obtained_mark ||
      student.ext_obtained_mark !== original.ext_obtained_mark ||
      student.remark_id !== original.remark_id ||
      student.final_remark_id !== original.final_remark_id ||
      student.marks_finalize !== original.marks_finalize;

    if (!isChanged) return; // skip unchanged rows

    // Normalize marks
    const valuationTypeId = Number(this.marksEntryFacultyFormGroup.value.valuation_type_id);
    const intMark = student.int_obtained_mark || 0;
    const extOBtinedMark = student.ext_obtained_mark;
    console.log('extOBtinedMark',extOBtinedMark);
    
    const extMark = valuationTypeId === 1
        ? (student.ext_obtained_mark || 0)
        : (student.reval_obtained_mark || 0);
    const totalMark = intMark + extMark;
    const marksFinalize = student.marks_finalize ? '1' : '0';


  let re_reval_flag = 'F';
if (student.max_marks_external && student.reval_obtained_mark != null && student.ext_obtained_mark != null) {
  const margin = Math.abs(student.reval_obtained_mark - student.ext_obtained_mark);
  const threshold = student.max_marks_external * 0.2;  // ✅ Correct reference
  if (margin > threshold) {
    re_reval_flag = 'T';
  }
}

    // === Condition 1: Insert + Update + Club ===
    if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
        re_reval_flag: re_reval_flag
      });

      let mappedExamTypeId = student.exam_paper_type_id;
      if (student.exam_paper_type_id === 9) mappedExamTypeId = 1;
      else if (student.exam_paper_type_id === 12) mappedExamTypeId = 2;

      payload.push({
        ...student,
        obtained_mark: totalMark,
        exam_paper_type_id: mappedExamTypeId,
        marks_finalize: marksFinalize,
        re_reval_flag: re_reval_flag
      });
    }

    // === Condition 2: Insert + Update (No Club) ===
    else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
        re_reval_flag: re_reval_flag
      });
    }

    // === Condition 3: Only Insert ===
    else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: totalMark,
        marks_finalize: marksFinalize,
      });
    }
  });

  if (payload.length === 0) {
    this.alert.alertMessage("No Changes", "No new or modified rows found.", "info");
    return;
  }

  console.log("✅ Final Payload:", payload);
  // Send to correct API (same logic)
  let apiUrl = '';
  if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentsclubedMarks';
  else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentsMarkDirectAndUpdateInReg';
  else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentMarkEntryInternalManually';

  this.HTTP.postData(apiUrl, payload, 'academic').subscribe(res => {
    if (!res.body.error){
            this.alert.alertMessage("Record Inserted!", "", "success");
      this.refreshStudentList()
    }
    else
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
  });
}

clearStudentTable() {
  // Clear the FormArray
  this.students.clear();
  
  // Also clear the data source if you have one
  this.attandanceList = [];
}










































}