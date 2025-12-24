import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService, HttpService, LoaderService, PrintService } from 'shared';

@Component({
  selector: 'app-exam-time-table',
  standalone: false,
  templateUrl: './exam-time-table.component.html',
  styleUrl: './exam-time-table.component.scss'
})
export class ExamTimeTableComponent {
  [x: string]: any;

  TimeTableFormGroup!: FormGroup
  editIndex: number | null = null;

  examTypeList: any[] = [];
  academicSessionList: any = [];
  degreeProgrammeTypeList: any = [];
  degreeProgrammeList: any = [];
  courseYearList: any = []
  examPaperTypeList: any[] = [];
  semesterList: any = []

  degreeList: any = []
  selectedItem: any;
  TimeTableFiledFormGroup!: FormGroup;
  TimeTablerowsFormGroup!: FormGroup;

  getcourseListForTimeTable: any[] = [];
  examShiftTimeList: any[] = [];

  selectAll = true;
  allExamTime: string = '';
  allEditable = false;
  allExamDate: string = '';
  showcourse = false;

  originalRows: any[] = [];
  filterCourse: string = '';
  filterDate: string = '';
  filterTime: string = '';
  payload_data: any;
  forupdatecourseList: any[] = [];

  currentDateTime = new Date().toLocaleString();
  print_row: any;
  printDash: any;
  isMultiCollege: boolean = false;
  isSVclg: boolean = false;
  isShowbutton: boolean = false
  previousYearaltBtn: boolean = false
  isSbumitBtn: boolean = false;
  timetable_main_id: number = 0;

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    private dialog: MatDialog,
    public print: PrintService,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService
  ) {
  }

  ngOnInit() {
    this.getExamTypeData();
    this.mainforfun();
  }

  mainforfun() {
    this.TimeTableFiledFormGroup = this.fb.group({});
    this.fildList.forEach(field => {
      this.TimeTableFiledFormGroup.addControl(
        field.id.toString(),
        field.required ? new FormControl('', Validators.required) : new FormControl('')
      );
    });

    this.TimeTablerowsFormGroup = this.fb.group({
      rows: this.fb.array([this.createRow()])
    });
  }

  // onSubmitRows() {
  //   if (this.TimeTablerowsFormGroup.invalid) {
  //     this.alert.alertMessage("Please fill in all required fields", "", "warning");
  //     this.TimeTablerowsFormGroup.markAllAsTouched(); // highlight invalid fields
  //     return;
  //   }
  //   // const rows = (this.TimeTablerowsFormGroup.get('rows') as FormArray).getRawValue();
  //   const selectedRows = this.rows.value.filter((row: any) => row.select);
  //   if (selectedRows.length === 0) {
  //     this.alert.alertMessage("Select Atleast one course!", "", "warning");
  //     return;
  //   }

  //   const formdata = this.getcourseListForTimeTable[0];
  //   const formgroupdata = this.payload_data;

  //   // 1) Main table payload
  //   const mainPayload = {
  //     academic_session_id: formgroupdata["Academic Session"],
  //     exam_type_id: formgroupdata["Exam Type"],
  //     course_year_id: formgroupdata["Course Year"],
  //     semester_id: formgroupdata["Semester"],
  //     degree_id: formgroupdata["Degree Program"],
  //     // dean_committee_id: formgroupdata["Dean Committee"],

  //     exam_paper_type_id: formgroupdata["Exam Paper Type"],
  //     is_finalize_yn: formdata.is_finalize_yn || 'N',
  //     is_issue_yn: formdata.is_issue_yn || 'N'
  //   };
  //   const detailPayload = this.TimeTablerowsFormGroup.value.rows
  //     .filter((r: any) => r.select)
  //     .map((r: any) => ({
  //       course_id: r.course_id,
  //       course_nature_id: 1,
  //       // dean_committee_id: formgroupdata["Dean Committee"],
  //       exam_date: r.exam_date,
  //       // exam_shift_time_id: firstRow.exam_shift_time_id.id,   // ✅ FIXED
  //       exam_shift_time_id: r.exam_shift_time_id?.id,   // ✅ FIXED
  //       is_finalize_yn: r.is_finalize_yn || 'N',
  //     }));

  //   // 3) Send everything in one request
  //   const payload = {
  //     ...mainPayload,
  //     courserows: detailPayload
  //   };


  //   let selectedData = selectedRows.map((data: any) => ({
  //     timetable_detail_id: data.timetable_detail_id,
  //     course_id: data.course_id,
  //     exam_date: data.exam_date,
  //     exam_shift_time_id: data.exam_shift_time_id?.id || data.exam_shift_time_id
  //   }))

  //   console.log("skdjk---------------------------------------------");
  //   console.log("payload : ====>>>>", payload);
  //   console.log("sds--------------------------------------------------00000000000000000000000");
  //   console.log("selectedData : ====>>>>", selectedData);
  // this.HTTP.postData('/timetable/post/saveExamTimeTable', payload, 'academic')
  //   .subscribe((result: any) => {
  //     const details = result?.body?.error?.details;
  //     if (!result.body.error) {
  //       this.onSubmitFields(); //^ reload page
  //       this.alert.alertMessage(result?.body?.data?.message || "Time Table saved successfully!", "", "success");
  //     } else {
  //       const message = Array.isArray(details) && details.length > 0
  //         ? details[0].message
  //         : result.body.error.message || "Unknown error occurred";

  //       // console.log(message);
  //       this.alert.alertMessage("Update failed!", message, "error");
  //     }
  //   });
  // }

  onSubmitRows() {
    const rows = this.rows.controls;
    // Get selected rows
    const selectedRows = rows.filter(row => row.get('select')?.value);

    if (selectedRows.length === 0) {
      this.alert.alertMessage("Select at least one course!", "", "warning");
      return;
    }
    let hasError = false;
    // Validate only selected rows
    selectedRows.forEach(row => {
      const examDateCtrl = row.get('exam_date');
      const examTimeCtrl = row.get('exam_shift_time_id');
      if (examDateCtrl?.invalid || examTimeCtrl?.invalid) {
        examDateCtrl?.markAsTouched();
        examTimeCtrl?.markAsTouched();
        hasError = true;
      }
      if (!this.timetable_main_id) {
        this.timetable_main_id = row.get('timetable_main_id')?.value;
      }
    });

    if (hasError) {
      this.alert.alertMessage("Please fill in required fields in selected rows", "", "warning");
      return;
    }
    // Proceed with saving
    const formdata = this.getcourseListForTimeTable[0];
    const formgroupdata = this.payload_data;

    const mainPayload = {
      academic_session_id: formgroupdata["Academic Session"],
      exam_type_id: formgroupdata["Exam Type"],
      course_year_id: formgroupdata["Course Year"],
      semester_id: formgroupdata["Semester"],
      degree_id: formgroupdata["Degree Program"],
      exam_paper_type_id: formgroupdata["Exam Paper Type"],
      is_finalize_yn: formdata.is_finalize_yn || 'N',
      is_issue_yn: formdata.is_issue_yn || 'N'
    };

    const detailPayload = selectedRows.map((r: any) => ({
      course_id: r.get('course_id')?.value,
      course_nature_id: 1,
      exam_date: r.get('exam_date')?.value,
      exam_shift_time_id: r.get('exam_shift_time_id')?.value?.id,
      is_finalize_yn: r.get('is_finalize_yn')?.value || 'N'
    }));

    const payload = {
      ...mainPayload,
      timetable_main_id: this.timetable_main_id,
      courserows: detailPayload
    };

    // console.log("payload : ====>>>>", payload);
    this.HTTP.postData('/timetable/post/saveExamTimeTable', payload, 'academic')
      .subscribe((result: any) => {
        const details = result?.body?.error?.details;
        if (!result.body.error) {
          this.onSubmitFields(); //^ reload page
          this.alert.alertMessage(result?.body?.data?.message || "Time Table saved successfully!", "", "success");
        } else {
          const message = Array.isArray(details) && details.length > 0
            ? details[0].message
            : result.body.error.message || "Unknown error occurred";
          // console.log(message);
          this.alert.alertMessage("Update failed!", message, "error");
        }
      });
  }

  // filter 
  applyFilter() {
    const course = this.filterCourse?.toLowerCase() || '';
    const date = this.filterDate || '';
    const time = this.filterTime || '';

    // clear current form rows
    (this.TimeTablerowsFormGroup.get('rows') as FormArray).clear();

    // filter original rows
    const filtered = this.originalRows.filter((row: any) => {
      const matchesCourse = course ? row.course_name?.toLowerCase().includes(course) : true;
      const matchesDate = date ? row.exam_date === date : true;
      const matchesTime = time ? row.exam_shift_time_id === time : true;
      return matchesCourse && matchesDate && matchesTime;
    });

    // add filtered rows back to FormArray
    filtered.forEach(r => {
      const fg = this.fb.group({
        select: [r.select],
        course_code: [r.course_code],
        course_name: [r.course_name],
        exam_date: [r.exam_date],
        exam_shift_time_id: [r.exam_shift_time_id],
        editable: [r.editable],
      });
      (this.TimeTablerowsFormGroup.get('rows') as FormArray).push(fg);
    });
  }

  // --- Edit a row ---
  editRow(row: any, index: number) {
    // Check: only allow edit if row is selected
    if (!row.get('timetable_detail_id')?.value) {
      this.alert.alertMessage("Please select this course before editing.", '', "warning");
      return;
    }

    this.editIndex = index;
    row.get('select')?.enable();
    row.get('exam_date')?.enable();
    row.get('exam_shift_time_id')?.enable();
    row.get('editable')?.setValue(true);
  }

  // --- Save row after edit ---
  updateRow(row: any, index: number) {
    // console.log("rowoooooooooooooo----->>", row?.value)
    let rowData = row?.value;
    let payload = {
      timetable_detail_id: rowData.timetable_detail_id,
      timetable_main_id: rowData.timetable_main_id,
      course_id: rowData.course_id,

      exam_date: rowData.exam_date,
      exam_shift_time_id: rowData.exam_shift_time_id?.id,
    }
    // console.log("payload----->>", payload);
    this.HTTP.putData('/timetable/update/updateExamTimeTable', payload, 'academic')
      .subscribe((result: any) => {
        const details = result?.body?.error?.details;

        if (!result.body.error) {
          this.onSubmitFields(); //^ reload page
          this.alert.alertMessage(result?.body?.data?.message || "Time Table Updated successfully!", "", "success");
        } else {
          const message = Array.isArray(details) && details.length > 0
            ? details[0].message
            : result.body.error.message || "Unknown error occurred";
          // console.log("result?.body?.error ==>>", result?.body?.error);
          // console.log(message);
          this.alert.alertMessage("Update failed!", result?.body?.error || message, "error");
        }
      });
  }

  // --- Delete row ---
  async removeRow(row: any, index: number) {
    // const row = this.rows.at(index);
    // if (!row?.value) {
    //   this.alert.alertMessage("Click Delete button.", '', "warning");
    //   return;
    // }
    // Show confirmation dialog
    const result = await this.alert.confirmAlert(
      "Are you sure you want to delete this row?",
      '',
      "question"
    );
    // result.value is true if user confirmed
    if (!result.value) {
      // User clicked "No" or dismissed the modal
      return;
    }
    let rowData = row?.value;
    let payload = {
      timetable_detail_id: rowData.timetable_detail_id,
      timetable_main_id: rowData.timetable_main_id,
      course_id: rowData.course_id,
    }
    this.HTTP.deleteData('/timetable/delete/deleteExamTimeTable', payload, 'academic')
      .subscribe((result: any) => {
        const details = result?.body?.error?.details;

        if (!result.body.error) {
          this.onSubmitFields(); //^ reload page
          // this.rows.removeAt(index);
          this.alert.alertMessage(result?.body?.data?.message || "Time Table Deleted Successfully!", "", "success");
        } else {
          const message = Array.isArray(details) && details.length > 0
            ? details[0].message
            : result.body.error.message || "Unknown error occurred";
          // console.log("result?.body?.error ==>>", result?.body?.error);
          // console.log(message);
          this.alert.alertMessage("Delete failed!", result?.body?.error || message, "error");
        }
      });
  }

  // --- Select All checkboxes ---
  toggleSelectAll() {
    this.rows.controls.forEach(row => {
      if (!row.get('timetable_detail_id')?.value) {
        row.get('select')?.setValue(this.selectAll);
      }
    });
  }

  // --- Set exam time for all ---
  setTimeForAll() {
    if (!this.allExamTime) return;
    this.rows.controls.forEach(row => {
      if (!row.get('timetable_detail_id')?.value) {
        row.get('exam_shift_time_id')?.setValue(this.allExamTime);
      }
    });
  }

  // --- Set exam date for all ---
  setDateForAll() {
    if (!this.allExamDate) return;
    this.rows.controls.forEach(row => {
      if (!row.get('timetable_detail_id')?.value) {
        row.get('exam_date')?.setValue(this.allExamDate);
      }
    });
  }

  // --- Set edit for all ---
  enableEditForAll() {
    this.allEditable = true;
    this.editIndex = null; // turn off single-row editing

    this.rows.controls.forEach(row => {
      row.get('select')?.enable();
      row.get('exam_date')?.enable();
      row.get('exam_shift_time_id')?.enable();
      row.get('editable')?.setValue(true);
    });
  }

  disableEditForAll() {
    this.allEditable = false;
    this.rows.controls.forEach(row => {
      row.get('select')?.disable();
      row.get('exam_date')?.disable();
      row.get('exam_shift_time_id')?.disable();
      row.get('editable')?.setValue(false);
    });
  }

  createRow(): FormGroup {
    return this.fb.group({
      select: [false],
      // course_code: [''],
      course_id: [],
      course_name: [''],
      exam_date: [{ value: '', disabled: true }],
      exam_shift_time_id: [null],
      editable: [false]
    });
  }

  get rows(): FormArray {
    return this.TimeTablerowsFormGroup.get('rows') as FormArray;
  }

  formatDate = (dateStr: string | null): string | null => {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);

    return `${year}-${month}-${day}`;
  };

  // optimize..
  onSubmitFields() {
    this.loaderService.showLoader();
    this.examShiftTimeData();

    const rawData = this.TimeTableFiledFormGroup.value;

    // ✅ Build allData using a single pass
    const allData = this.fildList.reduce((acc, field) => {
      acc[field.name] = rawData[field.id] || null;
      return acc;
    }, {} as any);

    this.payload_data = allData;
    // console.log("form==sd=>>", allData);

    // Construct payload directly
    const payload = {
      academic_session_id: allData["Academic Session"],
      semester_id: allData["Semester"],
      degree_programme_type_id: allData["Degree Programme Type"],
      degree_id: allData["Degree Program"],
      course_year_id: allData["Course Year"],
      // dean_committee_id: allData["Dean Committee"],
      exam_type_id: allData["Exam Type"],
      examDateTime: 1
    };

    // const formatDate = (dateStr: string | null) =>
    //   dateStr ? new Date(dateStr).toISOString().split('T')[0] : null;
    // console.log(payload);

    this.HTTP.getParam('/course/get/getRegisteredCourseList', payload, 'academic')
      .subscribe((result: any) => {
        if (result.body?.error) {
          this.alert.alertMessage("Something went wrong!", result.body.error?.message, "warning");
          return;
        }
        let apidata = result.body?.data || [];
        if (!apidata.length) {
          this.alert.alertMessage("No Records Found!", result.body.error?.message || "", "warning");
          return;
        } else {
          this.showcourse = true;
        }

        this.loadTableData(apidata);
        // console.timeEnd("⏱️ Build Rows Loop");
      });
    this.loaderService.hideLoader();
  }

  loadTableData(apidata: any[]) {
    // ✅ Sort the data: move records with timetable_detail_id to the bottom
    // apidata = apidata.sort((a: any, b: any) => {
    //   const hasA = !!a.timetable_detail_id;
    //   const hasB = !!b.timetable_detail_id;
    //   return Number(hasA) - Number(hasB); // false (0) comes before true (1)
    // });

    // Use Map for O(1) lookup
    const shiftMap = new Map(this.examShiftTimeList.map((s: any) => [s.id, s]));

    // Clear rows once
    const rowsArray = this.TimeTablerowsFormGroup.get('rows') as FormArray;
    rowsArray.clear();

    // console.time("⏱️ Build Rows Loop");
    // Build normalized list + patch rows in a single loop
    this.getcourseListForTimeTable = apidata.map((item: any) => {
      const shiftObj = shiftMap.get(item.exam_shift_time_id) || null;

      // console.log("shiftObj ===??==??: ", shiftObj);

      const row = this.fb.group({
        select: [!item.timetable_detail_id],
        course_id: [item.course_id],
        course_name: [item.course_name],
        exam_date: [{ value: this.formatDate(item.exam_date), disabled: item.timetable_detail_id }, Validators.required],
        exam_shift_time_id: [{ value: shiftObj, disabled: item.timetable_detail_id }, Validators.required],
        course_nature_id: [item.course_nature_id || null],
        // dean_committee_id: [item.dean_committee_id || null],
        is_finalize_yn: ['N'],
        editable: [item.timetable_detail_id],
        timetable_main_id: item.timetable_main_id,
        timetable_detail_id: item.timetable_detail_id
      });
      rowsArray.push(row);

      return {
        course_year_id: item.course_year_id,
        course_name: item.course_name,
        course_id: item.course_id,
        select: !!item.timetable_detail_id,
        course_code: item.course_code,
        academic_session_id: item.academic_session_id,
        degree_programme_id: item.degree_programme_id,
        semester_id: item.semester_id,
        exam_type_id: item.exam_type_id,
        exam_date: item.exam_date || null,
        exam_shift_time_id: item.exam_shift_time_id || null,
        course_nature_id: item.course_nature_id || null,
        // dean_committee_id: item.dean_committee_id || null,
        timetable_main_id: item.timetable_main_id,
        timetable_detail_id: item.timetable_detail_id || null
      };
    });
  }

  onDropdownChange(event: any, fieldName: string) {
    this.showcourse = false;
    // console.log(`Selected in ${fieldName}:`, event?.value);
    if (fieldName.trim() === 'Degree Programme Type') {
      this.getDegreeProgrammeData(event?.value); //* step 4
    } else if (fieldName.trim() === 'Academic Session') {
      this.getDegreeProgramTypeData(); //* step 3
    } else if (fieldName.trim() === 'Degree Program') {
      this.getCourseYearData(event?.value); //* step 5
    } else if (fieldName.trim() === 'Exam Type') {
      this.getAcademicSession(); //* step 2
    } else if (fieldName.trim() === 'Exam Paper Type') {
      this.getSemester(); //* step 7
    } else if (fieldName.trim() === 'Course Year') {
      this.getExamPaperTypeData(); //* step 6
    }
  }

  // * step 1
  getExamTypeData() {
    this.HTTP.getParam('/master/get/getExamType', {}, 'academic').subscribe((result: any) => {
      // console.log(result);
      this.examTypeList = (result.body.data || []).map((item: any) => ({
        id: item.exam_type_id,
        name: item.exam_type_name_e
      }));
      //  console.log(this.examTypeList);
    },
      (error) => {
        console.error('Error in examTypeList:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      });
  }

  // * step 2
  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession', {}, 'academic')
      .subscribe((result: any) => {
        this.academicSessionList = (result.body.data || []).map((item: any) => ({
          id: item.academic_session_id,
          name: item.academic_session_name_e
        }));
      },
        (error) => {
          console.error('Error in academicSessionList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  // * step 3
  getDegreeProgramTypeData() {
    this.HTTP.getParam('/master/get/getDegreeProgramType', {}, 'academic').subscribe((result: any) => {
      // console.log(result);
      this.degreeProgrammeTypeList = (result.body.data || []).map((item: any) => ({
        id: item.degree_programme_type_id,
        name: item.degree_programme_type_name_e
      }));
    },
      (error) => {
        console.error('Error in degreeProgrammeTypeList:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      });
  }

  // * step 4
  getDegreeProgrammeData(degree_programme_type_id: number) {
    // console.log("Called getDegreeProgrammeData------>>>");
    // console.log("degree_programme_type_id : ", degree_programme_type_id);
    this.HTTP.getParam('/master/get/getDegreePrograam', { degree_programme_type_id }, 'academic')
      .subscribe((result: any) => {
        this.degreeProgrammeList = (result.body.data || [])
          .map((item: any) => ({
            id: item.degree_id,
            name: item.degree_programme_name_e
          }));
      },
        (error) => {
          console.error('Error in degreeProgrammeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  // * step 5
  getCourseYearData(degree_programme_id: number) {
    this.HTTP.getParam('/master/get/getCourseYear', {}, 'academic').subscribe((result: any) => {
      let temp = this.TimeTableFiledFormGroup.value
      // ⭐ CONDITION: if type_id is 2 or 3 -> allow only year 1,2,3
      if (temp['3'] == 2 ||
        temp['3'] == 3) {
        this.courseYearList = result?.body?.data?.filter(
          (obj: any) => [1, 2, 3].includes(obj.course_year_id)
        ).map((item: any) => ({
          id: item.course_year_id,
          name: item.course_year_name_e
        }));
      } else {
        // otherwise show all
        this.courseYearList = this.courseYearList = (result.body.data || []).map((item: any) => ({
          id: item.course_year_id,
          name: item.course_year_name_e
        }));
      }
    },
      (error) => {
        console.error('Error in courseYearList:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      });
  }

  // * step 6
  getExamPaperTypeData() {
    this.HTTP.getParam('/master/get/getExamPaperType', {}, 'academic').subscribe((result: any) => {
      // console.log(result);
      this.examPaperTypeList = (result?.body?.data || [])
        .filter((ept: any) => ept.exam_paper_type_id === 1)
        .map((item: any) => ({
          id: item.exam_paper_type_id,
          name: item.exam_paper_type_name_e
        }));
      //  console.log(this.getExamPaperTypeList);
    },
      (error) => {
        console.error('Error in getExamPaperTypeList:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      });
  }

  // * step 7
  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList', {}, 'academic')
      .subscribe((result: any) => {
        // console.log(result);
        this.semesterList = (result.body.data || []).map((item: any) => ({
          id: item.semester_id,
          name: item.semester_name_e
        }));
      },
        (error) => {
          console.error('Error in semesterList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  examShiftTimeData() {
    this.HTTP.getParam('/master/get/getExamShiftTime', {}, 'academic')
      .subscribe((result: any) => {
        this.examShiftTimeList = (result?.body?.data || []).map((item: any) => ({
          id: item.exam_shift_time_id,
          name: item.exam_time
        }));
        // console.log(" this.examShiftTimeList ==> ", this.examShiftTimeList);
      },
        (error) => {
          console.error('Error in examShiftTimeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  fildList = [
    { id: 1, name: 'Exam Type', required: true, class: 'col-md-3 col-6' },
    { id: 2, name: 'Academic Session', required: false, class: 'col-md-3 col-6' },
    { id: 3, name: 'Degree Programme Type', required: false, class: 'col-md-6 col-6' },
    { id: 4, name: 'Degree Program', required: false, class: 'col-md-6 col-6' },
    { id: 5, name: 'Course Year', required: false, class: 'col-md-3 col-6' },
    { id: 6, name: 'Exam Paper Type', required: false, class: 'col-md-3 col-6' },
    { id: 7, name: 'Semester', required: true, class: 'col-md-3 col-6' },
  ];

  // get option value 
  getOptions(fieldName: string) {
    switch (fieldName) {
      case 'Academic Session': return this.academicSessionList;
      case 'Degree Programme Type': return this.degreeProgrammeTypeList;
      case 'Degree Program': return this.degreeProgrammeList;

      case 'Exam Type': return this.examTypeList;
      case 'Exam Paper Type': return this.examPaperTypeList;
      case 'Course Year': return this.courseYearList;

      case 'Semester': return this.semesterList;
      default: return [];
    }
  }

  resetForm(): void {
    this.TimeTableFiledFormGroup.reset()
    // this.courseYearList = [];
  }

  hasSpecificProgramme: boolean = false;
  printData() {
    const content = document.getElementById('print-section')?.innerHTML;
    if (content) {
      this.print.printHTML(content);
    } else {
      console.error('Printable section not found');
    }
  }
}
