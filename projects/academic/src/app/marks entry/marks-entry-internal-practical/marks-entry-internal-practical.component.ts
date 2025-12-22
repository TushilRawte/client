import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, AuthService, HttpService, PrintService } from 'shared';
import { MarksEntryReportComponent } from '../marks-entry-report/marks-entry-report.component';

@Component({
  selector: 'app-marks-entry-internal-practical',
  standalone: false,
  templateUrl: './marks-entry-internal-practical.component.html',
  styleUrl: './marks-entry-internal-practical.component.scss'
})
export class MarksEntryInternalPracticalComponent {

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
  getParticularExamPaperType: any;
  is_insert_in_marks_entry_detail: boolean = false;
  is_update_in_registration_marks: boolean= false;
  is_insert_club_in_marks_entry_detail: boolean= false;
  examPaperTypenameSelected: any;
  selectedCourse: any;

  constructor(private fb: FormBuilder,private HTTP :HttpService, private alert: AlertService,private dialog: MatDialog, private  auth:AuthService){ }

  ngOnInit(): void {
        // this.showEmpIdField = this.hasAllowedDesignation([327, 342, 2423]);
        this.marksEntryAdmin();
        this.getAcademicSession();
        this.getSemester();
        this.getDegreeProgrammeTypeData();
        this.getValuationType();
        this.getExamType();
        this.getRemark();
        this.getExamPaperType();
  }

  // user: any = {
  //   emp_id: 100001,
  //   designation_arr: [327],
  // };

  //   hasAllowedDesignation(allowed: number[]): boolean {
  //   return allowed.some(id => this.user?.designation_arr?.includes(id));
  // }

    emp_id: any;

  getEmployeeID(){
    this.emp_id = this.auth.getEmpID();
    console.log(this.emp_id);
  }


  marksEntryAdmin() {
  this.marksEntryFacultyFormGroup = this.fb.group({
    emp_id: [this.auth.getEmpID(), Validators.required],
    academic_session_id: ['', Validators.required],
    degree_programme_type_id: ['', Validators.required],
    semester_id: ['', Validators.required],
    valuation_type_id: ['', Validators.required],
    exam_type_id: ['', Validators.required],
    exam_paper_type_id: ['', Validators.required],
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
    const intImported = item.int_obtained_mark !== null && item.int_obtained_mark !== undefined && item.int_obtained_mark !== '';
    const intFinalized = Number(item.int_marks_finalize) === 1;
    const studentForm = this.fb.group({
      ue_id: [item.ue_id],
      student_name: [item.student_name],
      int_obtained_mark: [item.int_obtained_mark ?? 0, [Validators.min(0)]],
      ext_obtained_mark: [item.ext_obtained_mark ?? 0, []],
      total_obtained_marks: [(item.int_obtained_mark ?? 0) + (item.ext_obtained_mark ?? 0)],
      remark_id: [item.int_remark_id ?? ''],
      // final_remark_id: [item.ext_remark_id ?? ''],
      final_marks: [item.final_marks ?? 0],
      registration_id: [item.registration_id],
      college_id: [item.college_id],
      course_id: [selectedCourse.course_id],
      dean_committee_id: [selectedCourse.dean_committee_id],
      course_year_id: [selectedCourse.course_year_id],
      max_marks_internal: [item.max_marks_internal],
      max_marks_external: [item.max_marks_external],
      total_marks: [item.max_marks_internal + item.max_marks_external],

      // attach from parent form
      academic_session_id: this.marksEntryFacultyFormGroup.get('academic_session_id')?.value,
      semester_id: this.marksEntryFacultyFormGroup.get('semester_id')?.value,
      exam_paper_type_id: this.marksEntryFacultyFormGroup.get('exam_paper_type_id')?.value,
      course_nature_id: this.marksEntryFacultyFormGroup.get('course_nature_id')?.value,
      exam_type_id: this.marksEntryFacultyFormGroup.get('exam_type_id')?.value,
      valuation_type_id: this.marksEntryFacultyFormGroup.get('valuation_type_id')?.value,
      intImported: [ intImported ],
      intFinalized: [ intFinalized ],

      marks_finalize: [item.ext_marks_finalize === 1], // boolean for checkbox
      _original: this.fb.group({   // store original values to detect changes
        int_obtained_mark: [item.int_obtained_mark ?? 0],
        remark_id: [item.ext_remark_id ?? ''],
        // final_remark_id: [item.ext_remark_id ?? ''],
        // marks_finalize: [item.ext_marks_finalize === '1']
      })
    });

     if (Number(item.int_marks_finalize) === 1) {
      // studentForm.get('int_obtained_mark')?.disable();
      studentForm.get('remark_id')?.disable();
      // studentForm.get('final_remark_id')?.disable();
    }
    

    this.students.push(studentForm);

    // Auto calculate totals
    studentForm.get('int_obtained_mark')?.valueChanges.subscribe((newValue) => {
      this.updateTotal(studentForm);
       const prevValue = Number(studentForm.get('_original.int_obtained_mark')?.value ?? 0);
      const currentValue = Number(newValue ?? 0);
      if (prevValue > 0 && currentValue === 0) {
        studentForm.get('remark_id')?.setValue(15); // Changed to 0
      } else if (prevValue === 0 && currentValue > 0) {
        studentForm.get('remark_id')?.setValue(14); // Changed from 0 to >0
      }
      // update original for next change
      studentForm.get('_original.int_obtained_mark')?.setValue(currentValue);
    });

    studentForm.get('ext_obtained_mark')?.valueChanges.subscribe(() => {
      this.updateTotal(studentForm);
    });
  });
}



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
      // console.log(result);
      this.degreeProgrammeTypeList = result?.body?.data;
    });
  }

  // ~ ng init load semester
  getSemester(){
    this.HTTP.getParam('/master/get/getSemesterList/', {},'academic').subscribe((result: any) => {
      // console.log(result);
      this.semesterList = result.body.data;
    });
  }
    getValuationType(){
    this.HTTP.getParam('/master/get/getValuationType/', {},'academic').subscribe((result: any) => {
      // console.log(result);
      this.valuationTypeList = result.body.data;
    });
  }

  getExamType(){
    this.HTTP.getParam('/master/get/getExamType/', {},'academic').subscribe((result: any) => {
      // console.log(result);
      this.examTypeList = result.body.data;
    });
  }

  getRemark() {
    this.HTTP.getParam('/master/get/getRemark/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.remarkList = result.body.data;
    })
  }

    getExamPaperType() {
    this.HTTP.getParam('/master/get/getExamPaperType/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.getExamPaperTypeList = result.body.data;
    })
  }

    getExamWiseExamPaperType(selectedCourse:any){
      this.selectedCourse=selectedCourse
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
        this.getStudentList(selectedCourse,this.getParticularExamPaperType)
    })
  }

 onExamPaperTypeChange(selected: any) {
  this.marksEntryFacultyFormGroup.patchValue({
    exam_paper_type_id: selected.exam_paper_type_id,
    course_nature_id: selected.course_nature_id,

  });
      this.examPaperTypenameSelected = selected.exam_paper_type_name_e  
}

  getCourseList(){
    if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      emp_id:formValue.emp_id,
      academic_session_id : formValue.academic_session_id,
      semester_id : formValue.semester_id,
      exam_paper_type_id : formValue.exam_paper_type_id,
      degree_programme_type_id : formValue.degree_programme_type_id,
      exam_type_id:formValue.exam_type_id
    }

 this.HTTP.getParam('/attendance/get/getDashboardForPracticalMarksEntry/', params, 'academic').subscribe((res: any) => {
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
     if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      // emp_id:formValue.emp_id,
      academic_session_id : formValue?.academic_session_id,
      semester_id : formValue?.semester_id,
      degree_programme_type_id : formValue?.degree_programme_type_id,
      college_id:selectedCourse?.college_id,
      course_nature_id :formValue?.course_nature_id,
      course_id:selectedCourse?.course_id,
      course_registration_type_id:1,
      exam_type_id : formValue?.exam_type_id,
      course_semester_id : formValue?.semester_id,
      exam_paper_type_id_int :getParticularExamPaperType ?? formValue.exam_paper_type_id,
      exam_paper_type_id_ext: formValue?.exam_paper_type_id

    }
    this.HTTP.getParam('/attendance/get/getStudentListforExtPracticalMarksEntry/',params,'academic').subscribe((res:any) => {
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

onSubmit() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }

  const payload: any[] = [];

  this.students.controls.forEach((control) => {
    const studentControl = control as FormGroup;
    const student = studentControl.getRawValue();
    const original = student._original;

    const isNewRow = !original;

    const isChanged =
      isNewRow ||
      student.int_obtained_mark !== original.int_obtained_mark ||
      student.ext_obtained_mark !== original.ext_obtained_mark ||
      student.remark_id !== original.remark_id ||
      student.final_remark_id !== original.final_remark_id ||
      student.marks_finalize !== original.marks_finalize;

    if (!isChanged) return;

    const valuationTypeId = Number(this.marksEntryFacultyFormGroup.value.valuation_type_id);
    const intMark = student.int_obtained_mark || 0;

    const extMark =
      valuationTypeId === 1
        ? (student.ext_obtained_mark || 0)
        : (student.reval_obtained_mark || 0);

    const totalMark = intMark + extMark;
    const marksFinalize = student.marks_finalize ? '1' : '0';

    let re_reval_flag = 'F';
    if (student.max_marks_external && student.reval_obtained_mark != null && student.ext_obtained_mark != null) {
      const margin = Math.abs(student.reval_obtained_mark - student.ext_obtained_mark);
      const threshold = student.max_marks_external * 0.2;
      if (margin > threshold) {
        re_reval_flag = 'T';
      }
    }

    if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {

      // --- Valuation Type 1 & 2 ONLY ---
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

    // =============================================================
    // === Condition 2: Insert + Update (No Club) ===
    // =============================================================
    else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
        re_reval_flag
      });
    }

    // =============================================================
    // === Condition 3: Only Insert ===
    // =============================================================
    else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: totalMark,
        marks_finalize: marksFinalize
      });
    }

  });

  if (payload.length === 0) {
    this.alert.alertMessage("No Changes", "No new or modified rows found.", "info");
    return;
  }

  console.log("Final Payload:", payload);

  let apiUrl = '';
  if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentsclubedMarks';
  else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentsMarkDirectAndUpdateInReg';
  else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/post/saveStudentMarkEntryInternalManually';

  this.HTTP.postData(apiUrl, payload, 'academic').subscribe(res => {
    if (!res.body.error) {
      this.alert.alertMessage("Record Inserted!", "", "success");
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
//   if (!confirmFinalize) return;

//   const payload: any[] = [];

//   this.students.controls.forEach((control) => {
//     const studentControl = control as FormGroup;
//     const student = studentControl.value;

//     const intMark = student.int_obtained_mark || 0;
//     const extMark = student.ext_obtained_mark || 0;
//     const totalMark = intMark + extMark;
//     const marksFinalize = student.marks_finalize ? '1' : '0';

//     // === Condition 1: Insert + Update (No Club) ===
//     if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
//       payload.push({
//         ...student,
//         obtained_mark: extMark,
//         marks_finalize: marksFinalize,
//       });
//     }

//     // === Condition 2: Only Insert ===
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

//   if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
//     apiUrl = '/attendance/update/updateMarksFinalizeWithClub';
//   else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
//     apiUrl = '/attendance/update/updateMarksFinalizeInternal';

//   this.HTTP.putData(apiUrl, payload, 'academic').subscribe(res => {
//     if (!res.body.error){
//        this.alert.alertMessage("Marks Finalized!", "", "success");
//        this.refreshStudentList()
//     }
//     else
//       this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
//   });
// }

onFinalize() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }

  if (!window.confirm("Are you sure you want to finalize marks?")) return;

  const payload: any[] = [];

  this.students.controls.forEach((control) => {
    const studentControl = control as FormGroup;
    const student = studentControl.value;

    // ✅ include only CHECKED rows
    // if (!student.marks_finalize) return;

    const intMark = student.int_obtained_mark || 0;
    const extMark = student.ext_obtained_mark || 0;
    const totalMark = intMark + extMark;

    const marksFinalize = student.marks_finalize ? "1" : "0";
        // const marksFinalize = student.marks_finalize ;


    // === Condition 1: Insert + Update + Club ===
    if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
      });
    }
      // === Condition 1: Insert + Update (No Club) ===
   else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
      });
    }

    // === Condition 2: Only Insert ===
    else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: totalMark,
        marks_finalize: marksFinalize,
      });
    }
  });

  console.log("🟢 Finalize Payload:", payload);
  
  if (payload.length === 0) {
    this.alert.alertMessage("No Data", "Please check at least one student to finalize.", "info");
    return;
  }

  let apiUrl = "";

  if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail)
    apiUrl = "/attendance/update/updateMarksFinalizeWithClub";
  else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = "/attendance/update/updateMarksFinalizeInternal";

  this.HTTP.putData(apiUrl, payload, "academic").subscribe((res) => {
    if (!res.body.error) {
      this.alert.alertMessage("Marks Finalized!", "", "success");
      this.refreshStudentList();
    } else {
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
    }
  });
}


onUnfinalize() {
  if (this.marksEntryFacultyFormGroup.invalid) {
    this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
    return;
  }

  const confirmUnfinalize = window.confirm("Are you sure you want to unfinalize marks?");
  if (!confirmUnfinalize) return;

  const payload: any[] = [];

  this.students.controls.forEach((control) => {
    const studentControl = control as FormGroup;
    const student = studentControl.value;

    // process ONLY unchecked rows
    if (student.marks_finalize) return;

    const intMark = student.int_obtained_mark || 0;
    const extMark = student.ext_obtained_mark || 0;
    const totalMark = intMark + extMark;
    const marksFinalize = '0'; // unfinalized flag

      // === Condition 1: Insert + Update + Club ===
    if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
      });
    }

    // === Condition 1: Insert + Update (No Club) ===
   else if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: extMark,
        marks_finalize: marksFinalize,
      });
    }

    // === Condition 2: Only Insert (No Update, No Club) ===
    else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail) {
      payload.push({
        ...student,
        obtained_mark: totalMark,
        marks_finalize: marksFinalize,
      });
    }
  });

  if (payload.length === 0) {
    this.alert.alertMessage("No Data", "No unchecked rows to unfinalize.", "info");
    return;
  }

  console.log("🟡 Unfinalize Payload:", payload);

  let apiUrl = '';

  if (this.is_insert_in_marks_entry_detail && this.is_update_in_registration_marks && this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/update/updateMarksUnfinalizeWithClub';
  else if (this.is_insert_in_marks_entry_detail && !this.is_update_in_registration_marks && !this.is_insert_club_in_marks_entry_detail)
    apiUrl = '/attendance/update/updateMarksUnfinalizeInternal';

  this.HTTP.putData(apiUrl, payload, 'academic').subscribe(res => {
    if (!res.body.error){
      this.alert.alertMessage("Marks Unfinalized!", "", "success");
      this.refreshStudentList()
    }
    else
      this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
  });
}

searchUeId: string = '';

get filteredStudents() {
  if (!this.searchUeId) return this.students.controls;
  return this.students.controls.filter(s =>
    s.value.ue_id?.toString().toLowerCase().includes(this.searchUeId.toLowerCase())
  );
}

  // Refresh student list
  refreshStudentList() {
    if (this.selectedCourse) {
      this.getExamWiseExamPaperType(this.selectedCourse);
    } else {
      this.alert.alertMessage("Info", "No course selected to refresh.", "info");
    }
  }

  
  getStudentListForDialog(selectedCourse: any, getParticularExamPaperType: any) {
    return new Promise((resolve, reject) => {
  
      const formValue = this.marksEntryFacultyFormGroup.value;
  
      const params = {
        academic_session_id: formValue?.academic_session_id,
        semester_id: formValue?.semester_id,
        degree_programme_type_id: formValue?.degree_programme_type_id,
        college_id: selectedCourse?.college_id,
        course_nature_id: formValue?.course_nature_id,
        course_id: selectedCourse?.course_id,
        course_registration_type_id: 1,
        exam_type_id: formValue?.exam_type_id,
        course_semester_id: formValue?.semester_id,
        exam_paper_type_id_int: getParticularExamPaperType ?? formValue.exam_paper_type_id,
        exam_paper_type_id_ext: formValue?.exam_paper_type_id
      };
  
      this.HTTP.getParam('/attendance/get/getStudentListforMarksEntry/', params, 'academic')
        .subscribe((res: any) => {
          if (!res.body.error) {
            resolve(res.body.data);  // 🔥 return fresh data
          } else {
            this.alert.alertMessage("Something Went Wrong...!", "", "warning");
            reject([]);
          }
        });
    });
  }
  
  openDialog(item: any) {
    this.getStudentListForDialog(item, null).then((freshStudents: any) => {
      const dialogRef = this.dialog.open(MarksEntryReportComponent, {
        width: '800px',
        height:'600px',
        data: {
          emp_id: this.auth.getEmpID(),
          selectedCourse: item,
          formHeader: this.marksEntryFacultyFormGroup.value,
          students: freshStudents      // 🔥 fresh students always
        },
        autoFocus: true
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log("Dialog closed:", result);
        }
      });
  
    });
  
  }


 }

