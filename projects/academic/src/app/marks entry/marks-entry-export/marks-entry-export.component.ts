import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';
import { reportConfig } from 'environment';

@Component({
  selector: 'app-marks-entry-export',
  standalone: false,
  templateUrl: './marks-entry-export.component.html',
  styleUrl: './marks-entry-export.component.scss',
})
export class MarksEntryExportComponent {
  marksEntryFacultyFormGroup!: FormGroup;
  acadmcSesnList: any;
  semesterList: any;
  collegeList: any;
  getExamPaperTypeList: any;
  yearList: any;
  degreeProgramme: any;
  courseList: any;
  studentList: any;
  studentPhotList: any;
  // options: any = reportConfig

  constructor(
    private fb: FormBuilder,
    private HTTP: HttpService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.marksEntryAdmin();
    this.getAcademicSession();
    this.getSemester();
    this.getExamPaperType();
    this.getCollegeData();
    this.getYearData();
    this.getDegreeProgramme();
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

  onCollegeChange(college_id: number) {
    // console.log('Selected College ID:', college_id);
    // this.getDegreeProgramme(college_id);
    // this.courseAllotFormGroup.get('degree_programme_id')?.reset();
    // this.courseYearList = [];
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
      course_nature_id: selected.course_nature_id, // <-- set course nature here
    });
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
      '/attendance/get/getDashForExportDataForFireEye/',payload,'academic'
    ).subscribe((result: any) => {
      this.courseList = result.body.data;
      this.optionsCourse.dataSource = this.courseList;
      this.optionsCourse.listLength = this.courseList.length;
      this.studentPhotList = [];
      this.studentList = [];
      console.log('API Response dash:', result);
    });
  }

  getStudentDataForExportFromTemp(item: any) {
    const formData = this.marksEntryFacultyFormGroup.value;
    console.log('Form Data to Submit:', formData);
    const payload = {
      academic_session_id: formData.academic_session_id,
      semester_id: formData.semester_id,
      exam_paper_type_id: formData.exam_paper_type_id,
      degree_programme_id: formData.degree_programme_id,
      dean_committee_id: item.dean_committee_id,
      course_year_id: item.course_year_id,
    };
    this.HTTP.getParam(
      '/attendance/get/exportFireEyeDatafromTemp/', payload,'academic').subscribe((result: any) => {
 const data = result?.body?.data ?? [];

      // 🔴 NO DATA FOUND
      if (!data.length) {
        alert('No data found. Please prepare data first.');
        return;   // ⛔ stop further execution
      }

      // ✅ DATA FOUND
      this.studentList = data;
      this.studentListoptions.dataSource = this.studentList;
      this.studentListoptions.listLength = this.studentList.length;

      console.log('API Response:', data);
    });
  }

  getStudentphoto(item: any) {
    const formData = this.marksEntryFacultyFormGroup.value;
    console.log('Form Data to Submit:', formData);
    const payload = {
      academic_session_id: formData.academic_session_id,
      semester_id: formData.semester_id,
      exam_paper_type_id: formData.exam_paper_type_id,
      degree_programme_id: formData.degree_programme_id,
      dean_committee_id: item.dean_committee_id,
      course_year_id: item.course_year_id,
      studentMasterWise: true,
    };
    this.HTTP.getParam(
      '/attendance/get/exportFireEyeDatafromTemp/',
      payload,
      'academic'
    ).subscribe((result: any) => {
      this.studentPhotList = result.body.data;
      this.studentPhotoListoptions.dataSource = this.studentPhotList;
      this.studentPhotoListoptions.listLength = this.studentPhotList.length;
    });
  }

onSubmit(item: any) {
  const formData = this.marksEntryFacultyFormGroup.value;

  const payload = {
    academic_session_id: formData.academic_session_id,
    semester_id: formData.semester_id,
    exam_paper_type_id: formData.exam_paper_type_id,
    degree_programme_id: formData.degree_programme_id,
    course_year_id: item.course_year_id,
    dean_committee_id: item.dean_committee_id,
  };

  console.log('Payload to Submit:', payload);

  this.HTTP.postData(
    '/attendance/post/insertExportDataFireeye/',
    payload,
    'academic'
  ).subscribe({
    next: (result: any) => {
      const res = result?.body?.data || result?.body;

      if (!res?.error) {
        // ✅ Success
        this.alert.alertMessage(
          'Data Exported Successfully',
          res?.message || 'Export completed successfully.',
          'success'
        );
      } else {
        // ⚠️ Backend sent logical error (like “No data found”)
        this.alert.alertMessage(
          'Warning',
          res?.message || 'Something went wrong!',
          'warning'
        );
      }
    },
    error: (err) => {
      // ❌ HTTP/Server Error
      console.error('API Error:', err);
      this.alert.alertMessage(
        'Error',
        err?.message || 'Internal Server Error',
        'error'
      );
    },
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
    title: '',
  };

  studentListoptions: any = {
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
    pageSize: 10,
    title: '',
  };

  studentPhotoListoptions: any = {
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
    pageSize: 10,
    title: '',
  };
}
