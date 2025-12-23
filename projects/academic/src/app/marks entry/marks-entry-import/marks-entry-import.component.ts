import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-marks-entry-import',
  standalone: false,
  templateUrl: './marks-entry-import.component.html',
  styleUrl: './marks-entry-import.component.scss'
})
export class MarksEntryImportComponent {


  marksImportFormGroup! : FormGroup
  dashBoardList: any;
  dashBoardDetailList: any;
  marksEntryFacultyFormGroup: any;
  acadmcSesnList: any;
  semesterList: any;
  getExamPaperTypeList: any;
  collegeList: any;
  yearList: any;
  degreeProgramme: any;
  courseList: any;
  selectedDeancommitteid: any;
  selectedCourseYearId: any;
  selectedCourseNature: any;
  selectedDegree_programme_type_id: any;
  getParticularExamPaperType: any;
  isShowFinalClubButton: boolean = false

  constructor(private fb: FormBuilder,private HTTP :HttpService, private alert: AlertService,){ }

 ngOnInit() {
  this.marksImportFormGroup = this.fb.group({
    file: [null]   
  });
    this.marksEntryAdmin();
    this.getAcademicSession();
    this.getSemester();
    this.getExamPaperType();
    this.getCollegeData();
    this.getYearData();
    this.getDegreeProgramme();
}

// Handle file input
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.marksImportFormGroup.patchValue({ file: file });
    this.marksImportFormGroup.get('file')?.updateValueAndValidity();
  }
}

 marksEntryAdmin() {
    this.marksEntryFacultyFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      // degree_programme_type_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      exam_paper_type_id: ['', Validators.required],
      college_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
    });
  }



  getAcademicSession() {
    this.HTTP.getParam(
      '/master/get/getAcademicSession/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data;
    });
  }

  getSemester() {
    this.HTTP.getParam(
      '/master/get/getSemesterList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.semesterList = result.body.data;
    });
  }

  getExamPaperType() {
    this.HTTP.getParam(
      '/master/get/getExamPaperType/',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.getExamPaperTypeList = result.body.data;
    });
  }

  getCollegeData() {
    this.HTTP.getParam(
      '/master/get/getCollegeList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log(result);
      this.collegeList = result.body.data;
    });
  }

  getYearData() {
    this.HTTP.getParam(
      '/master/get/getCourseYearList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      // console.log(result);
      this.yearList = result.body.data;
    });
  }

  onExamPaperTypeChange(selected: any) {
    this.marksEntryFacultyFormGroup.patchValue({
      exam_paper_type_id: selected.exam_paper_type_id,
      course_nature_id: selected.course_nature_i
     // <-- set course nature here
    });
      this.selectedCourseNature = selected.course_nature_id 
  }

  getDegreeProgramme() {
    this.HTTP.getParam(
      '/master/get/getDegreeProgramme/',
      {},
      'academic'
    ).subscribe((result: any) => {
      this.degreeProgramme = result.body.data;
      console.log('Initial Degree Programme:', this.degreeProgramme);

      // Add hardcoded objects only if college_id = 5
      // if (college_id === 5) {
      //   const extraProgrammes = [
      //     {
      //       degree_programme_id: 14,
      //       degree_programme_name_e: "M.Sc.(Ag.) (PGS)",
      //       degree_id: 12,
      //       subject_id: 139
      //     },
      //     {
      //       degree_programme_id: 37,
      //       degree_programme_name_e: "Ph.D in Agriculture (PGS)",
      //       degree_id: 5,
      //       subject_id: 139
      //     }
      //   ];

      //   // Push into array
      //   this.degreeProgramme.push(...extraProgrammes);
      // }

      console.log('Final Degree Programme:', this.degreeProgramme);
    });
  }

  onDegreeProgrammeChange(degree_programme_id: number) {
    const selected = this.degreeProgramme.find(
      (p: { degree_programme_id: number }) =>
        p.degree_programme_id === degree_programme_id
    );
    const degree_id = selected?.degree_id;
    const subject_id = selected?.subject_id;
    this.selectedDegree_programme_type_id = selected?.degree_programme_type_id;
    //   this.selectedDegreeProTypeId = selected?.degree_programme_type_id;
    // if (this.marksEntryFacultyFormGroup) {
    //   this.marksEntryFacultyFormGroup.patchValue({
    //     degree_programme_type_id: this.selectedDegreeProTypeId,
    //     degree_programme_id: degree_programme_id
    //   });
    // }
  }

  getDashboardData() {
    const formData = this.marksEntryFacultyFormGroup.value;
    console.log('Form Data to Submit:', formData);
    const payload = {
      academic_session_id: formData.academic_session_id,
      semester_id: formData.semester_id,
      exam_paper_type_id: formData.exam_paper_type_id,
      degree_programme_id: formData.degree_programme_id,
    };
    if (
      !payload.academic_session_id ||
      !payload.semester_id ||
      !payload.exam_paper_type_id ||
      !payload.degree_programme_id
    ) {
      alert('⚠️ All fields are required!');
      return; // Stop execution
    }
    this.HTTP.getParam(
      '/attendance/get/getDashForExportDataForFireEye/',
      payload,
      'academic'
    ).subscribe((result: any) => {
      this.courseList = result?.body?.data;
      this.optionsCourse.dataSource = this.courseList;
      this.optionsCourse.listLength = this.courseList.length;
      // this.dashBoardListoptions = [];
      this.dashBoardList = [];
      console.log('API Response:', result);
    });
  }

// Submit to Node.js backend
// onSubmit() {
//   if (!this.marksImportFormGroup.value.file) {
//     this.alert.alertMessage("Please select a file!", "", "warning");
//     return;
//   }
//   // console.log("FormGroup value:", this.marksImportFormGroup.value);
//   const formData = new FormData();
//   formData.append('file', this.marksImportFormGroup.value.file);

//     formData.forEach((val, key) => {
//     console.log(key, val);
//   });
  
// this.HTTP.postFile('/attendance/postFile/importStudentsMarksData', formData, 'academic')
//   .subscribe((res: any) => {
//     if (res?.success) {
//       this.alert.alertMessage(
//         `File uploaded successfully! ${res.count} records imported.`,
//         "",
//         "success"
//       );
//       this.dashBoardDetailList = [];
//     } 
//   }, (err) => {
//     console.error("Upload error:", err);

//     let msg = "Upload failed!";
//     if (err?.error?.message) {
//       msg = err.error.message;
//     } else if (err?.status === 413) {
//       msg = "File too large! Please upload a smaller file.";
//     } else if (err?.status === 400) {
//       msg = "Invalid file format or request.";
//     } else if (err?.status === 0) {
//       msg = "Cannot connect to server. Please try again.";
//     }

//     this.alert.alertMessage(msg, "", "warning");
//   });


// }

onSubmit() {
  const file = this.marksImportFormGroup.value.file;

  // Step 1: Validate if file selected
  if (!file) {
    this.alert.alertMessage("Please select a file!", "", "warning");
    return;
  }

  // Step 2: Validate file extension (only .csv)
  const fileName = file.name || "";
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  if (fileExtension !== "csv") {
    this.alert.alertMessage("Only CSV files are allowed!", "", "warning");
    return;
  }

  // Step 3: Prepare FormData
  const formData = new FormData();
  formData.append('file', file);

  // Step 4: Upload file
  this.HTTP.postFile(
    '/attendance/postFile/importStudentsMarksData',
    formData,
    'academic'
  ).subscribe(
    (res: any) => {
      console.log("Upload Response:", res);
      const responseData = res?.body?.data;
      if (responseData) {
        if (responseData.error === false) {
          this.alert.alertMessage(responseData.message || "File imported successfully!", "", "success");
          this.dashBoardDetailList = [];
          return;
        } else if (responseData.error === true) {
          this.alert.alertMessage(responseData.message || "Error during import!", "", "warning");
          return;
        }
      }

      this.alert.alertMessage("Unexpected response from server!", "", "warning");
    },
    (err) => {
      console.error("Upload error:", err);

      let msg = "Upload failed!";
      if (err?.error?.message) {
        msg = err.error.message;
      } else if (err?.status === 413) {
        msg = "File too large! Please upload a smaller file.";
      } else if (err?.status === 400) {
        msg = "Invalid file format or request.";
      } else if (err?.status === 0) {
        msg = "Cannot connect to server. Please try again.";
      }

      this.alert.alertMessage(msg, "", "warning");
    }
  );
}

 
  getFireEyeDashboard(item: any) {
    this.getExamWiseExamPaperType(item);

  this.selectedDeancommitteid = item.dean_committee_id;
  this.selectedCourseYearId = item.course_year_id;

  const formData = this.marksEntryFacultyFormGroup.value;
  const payload = {
    academic_session_id: formData.academic_session_id,
    course_semester_id: formData.semester_id,
    exam_paper_type_id: formData.exam_paper_type_id,
    degree_programme_id: formData.degree_programme_id,
    dean_committee_id: item.dean_committee_id,
    course_year_id: item.course_year_id,
  };

  this.HTTP.getParam(
    '/attendance/get/getDashboardForValidateFireEyeImportedData/',
    payload,
    'academic'
  ).subscribe(
    (result: any) => {
      this.dashBoardList = result?.body?.data || [];

      if (!this.dashBoardList.length) {
        this.alert.alertMessage('No Data Found', '', 'warning');
      }
    },
    (error) => {
      console.error('Error fetching dashboard data:', error);
      this.alert.alertMessage('Error fetching data', '', 'error');
    }
  );
}





// onBadgeClick(item: any) {
//   const formData = this.marksEntryFacultyFormGroup.value;
//   const payload = {
//     academic_session_id: formData.academic_session_id,
//     course_semester_id: formData.semester_id,
//     exam_paper_type_id: formData.exam_paper_type_id,
//     degree_programme_id: formData.degree_programme_id,
//     dean_committee_id: this.selectedDeancommitteid,
//     course_year_id: this.selectedCourseYearId,
//     export_academic_session_id: formData.academic_session_id,
//     export_course_semester_id: formData.semester_id,
//     export_exam_paper_type_id: formData.exam_paper_type_id,
//     export_degree_programme_id: formData.degree_programme_id,
//     export_dean_committee_id: this.selectedDeancommitteid,
//     export_course_year_id: this.selectedCourseYearId,
//     import_academic_session_id: formData.academic_session_id,
//     import_course_semester_id: formData.semester_id,
//     import_exam_paper_type_id: formData.exam_paper_type_id,
//     import_degree_programme_id: formData.degree_programme_id,
//     import_dean_committee_id: this.selectedDeancommitteid,
//     import_course_year_id: this.selectedCourseYearId,
//     comparison_status: item.comparison_status 
//   };
  
//   this.HTTP.getParam('/attendance/get/getValidatedDataFromFireeye/', payload, 'academic').subscribe(
//     (result: any) => {
//       this.dashBoardDetailList = result?.body?.data;
//       this.dashBoardListoptions.dataSource = this.dashBoardDetailList;
//       this.dashBoardListoptions.listLength = this.dashBoardDetailList.length;

//     }
//   );
// }

fetchFireEyeData(item: any, callback?: (data: any) => void) {
  const formData = this.marksEntryFacultyFormGroup.value;

  const payload = {
    academic_session_id: formData.academic_session_id,
    course_semester_id: formData.semester_id,
    exam_paper_type_id: formData.exam_paper_type_id,
    degree_programme_id: formData.degree_programme_id,
    dean_committee_id: this.selectedDeancommitteid,
    course_year_id: this.selectedCourseYearId,
    export_academic_session_id: formData.academic_session_id,
    export_course_semester_id: formData.semester_id,
    export_exam_paper_type_id: formData.exam_paper_type_id,
    export_degree_programme_id: formData.degree_programme_id,
    export_dean_committee_id: this.selectedDeancommitteid,
    export_course_year_id: this.selectedCourseYearId,
    import_academic_session_id: formData.academic_session_id,
    import_course_semester_id: formData.semester_id,
    import_exam_paper_type_id: formData.exam_paper_type_id,
    import_degree_programme_id: formData.degree_programme_id,
    import_dean_committee_id: this.selectedDeancommitteid,
    import_course_year_id: this.selectedCourseYearId,
    comparison_status: item.comparison_status
  };

  this.HTTP.getParam('/attendance/get/getValidatedDataFromFireeye/', payload, 'academic')
    .subscribe((result: any) => {
      const data = result?.body?.data || [];
      this.dashBoardDetailList = data;
      this.dashBoardListoptions.dataSource = data;
      this.dashBoardListoptions.listLength = data.length;

      if (callback) callback(data); 
    });
}

  onBadgeClick(item: any) {
  this.fetchFireEyeData(item);
}

onEditClick(item: any) {
  this.isShowFinalClubButton = true
  this.fetchFireEyeData(item, (fetchedData) => {
    const payload = {
      ...item,
      updatedRecords: fetchedData,
    };

    console.log("Update Payload:", payload);
    
    this.HTTP.putData('/attendance/update/updateValidatedMarksfromFireEyeTempToExported/', payload, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Data Updated Successfully!", "", "success");
        } else {
          this.alert.alertMessage("Update Failed!", res.body.message || "", "warning");
        }
      });
  });
}

    getExamWiseExamPaperType(selectedCourse:any){
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      exam_type_id : 1,
       degree_programme_type_id : this.selectedDegree_programme_type_id,
      valuation_type_id: 1,
      exam_paper_type_id: formValue.exam_paper_type_id,
      dean_committee_id:selectedCourse.dean_committee_id,
    }
      this.HTTP.getParam('/attendance/get/getExamWiseExamPaperType/',params ,'academic').subscribe((result:any) => {
        this.getParticularExamPaperType = result.body.data[0]?.club_with_exam_paper_type_id;

  
    })
  }



// onSave(){
//   const formData = this.marksEntryFacultyFormGroup.value;
//   const payload = {
//     academic_session_id: formData.academic_session_id,
//     course_semester_id: formData.semester_id,
//     int_exam_paper_type_id: this.getParticularExamPaperType,
//     academic_session_id2: formData.academic_session_id,
//     semester_id: formData.semester_id,
//     ext_exam_paper_type_id: formData.exam_paper_type_id,
//     academic_session_id3: formData.academic_session_id,
//     semester_id2: formData.semester_id,
//     course_nature_id: this.selectedCourseNature,
//     exam_type_id:1
//   }
//   this.HTTP.postData(  '/attendance/post/marksEntryFromFireData/', payload, 'academic'  ).subscribe((result: any) => {    this.alert.alertMessage(
//       'Data Saved Successfully',
//       result?.body?.message || 'Save completed successfully.',
//       'success'
//     );
//   });
// }

onSave() {
  const formData = this.marksEntryFacultyFormGroup.value;

  // ✅ Validate required fields
  if (
    !formData.academic_session_id ||
    !formData.semester_id ||
    !formData.exam_paper_type_id ||
    !this.getParticularExamPaperType ||
    !this.selectedCourseNature
  ) {
    this.alert.alertMessage(
      'All Fields Are Required',
      'Please fill all mandatory fields before saving.',
      'warning'
    );
    return;
  }

  // ✅ Prepare payload
  const payload = {
    academic_session_id: formData.academic_session_id,
    course_semester_id: formData.semester_id,
    int_exam_paper_type_id: this.getParticularExamPaperType,
    academic_session_id2: formData.academic_session_id,
    semester_id: formData.semester_id,
    ext_exam_paper_type_id: formData.exam_paper_type_id,
    academic_session_id3: formData.academic_session_id,
    semester_id2: formData.semester_id,
    course_nature_id: this.selectedCourseNature,
    exam_type_id: 1
  };


  // ✅ API Call with proper response handling
  this.HTTP.postData(
    '/attendance/post/marksEntryFromFireData/',
    payload,
    'academic'
  ).subscribe({
    next: (result: any) => {
      const res = result?.body?.data || result?.body;

      if (!res?.error) {
        // ✅ Success
        this.alert.alertMessage(
          'Data Saved Successfully',
          res?.message || 'Save completed successfully.',
          'success'
        );
      } else {
        // ⚠️ Logical warning from backend
        this.alert.alertMessage(
          'Warning',
          res?.message || 'Unexpected response from server.',
          'warning'
        );
      }
    },
    error: (err) => {
      // ❌ HTTP/Server error
      console.error('API Error:', err);
      this.alert.alertMessage(
        'Error',
        err?.message || 'Internal Server Error',
        'error'
      );
    }
  });
}



    optionsCourse: any = {
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
    title: 'Report',
  };

    dashBoardListoptions: any = {
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
    pageSize: 2,
    title: 'Report',
  };


}
