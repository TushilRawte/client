import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-exam-time-table-report',
  standalone: false,
  templateUrl: './exam-time-table-report.component.html',
  styleUrl: './exam-time-table-report.component.scss'
})
export class ExamTimeTableReportComponent {
   groupedData: any = {};
  objectKeys = Object.keys;
  apiData: any = [];
  @ViewChild('print_content') print_content!: ElementRef;

  TimeTableFormGroup!: FormGroup
  acadmcSesnList: any = []
  semesterList: any = []
  degreeList: any = []
  TimeTableFiledFormGroup!: FormGroup;
  TimeTablerowsFormGroup!: FormGroup;

  hasSpecificProgramme: boolean = false;

  courseYearList: any = []
  collegeList: any = []
  degreePrograamList: any = []
  DegreeProgramTypeList: any = []

  courseList: any[] = [];
  courseNatureList: any[] = [];
  deanCommitteeList: any[] = [];
  degreeProgramList: any[] = [];
  tempDegreeProgrammeList: any[] = [];
  getCourseYearList: any[] = [];
  getDeanCommiteeList: any[] = [];
  getExamPaperTypeList: any[] = [];
  getExamTypeList: any[] = [];
  getcourseListForTimeTable: any[] = [];
  examTypeList: any[] = [];

  facultyList: any[] = [];
  subjectList: any[] = [];
  coursesList: any;

  showcourse = false;

  currentDateTime = new Date().toLocaleString();
  print_row: any;
  printDash: any;
  isMultiCollege: boolean = false;
  isSVclg: boolean = false;
  isShowbutton: boolean = false
  previousYearaltBtn: boolean = false
  isSbumitBtn: boolean = false

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    private dialog: MatDialog,
    public print: PrintService,
    private snackBar: MatSnackBar
  ) { }
  ngOnInit() {
    this.getAcademicSession();
    // this.getCourseYearData();
    // this.getExamTypeData();
    // this.getSemester();
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
  }

  onSubmitFields() {
    this.showcourse = true;
    const rawData = this.TimeTableFiledFormGroup.value;
    let finalPayload: any;
    const allData = this.fildList.reduce((acc, field) => {
      acc[field.name] = rawData[field.id] || null;
      return acc;
    }, {} as any);

    const payload = {
      "academic_session_id": allData["Academic Session"],
      "semester_id": allData["Semester"],
      "degree_id": allData["Degree Program"] || 1,
      "course_year_id": allData["Course Year"],
      "exam_type_id": allData["Exam Type"],
      "examDateTime": 1
    };
    this.HTTP.getParam('/course/get/getRegisteredCourseList', payload, 'academic')
      .subscribe((result: any) => {
        if (!result.body.error) {
          let temp = result.body.data || [];
          this.apiData = temp.filter((row: any) => row.timetable_main_id !== null &&
            row.timetable_detail_id !== null);
          // this.apiData = temp
          if (this.apiData.length === 0) {
            this.alert.alertMessage("No Record Found!", "", "warning");
          } else {
            this.groupedData = this.groupRowsNested(this.apiData);
          }
        } else {
          this.alert.alertMessage("Something went wrong!", result.body.error?.message, "warning");
        }
      });
  }

  // ^ ---------------------------------------- master method start
  // onDropdownChange(event: any, fieldName: string) {
  //   this.getDegreePrograamData(event);
  // }

  onDropdownChange(event: any, fieldName: string) {
    this.showcourse = false;
    // console.log(`Selected in ${fieldName}:`, event);
    if (fieldName.trim() === 'Degree Programme Type') {
      this.getDegreePrograamData(event); //* step 3
    } else if (fieldName.trim() === 'Academic Session') {
      this.getDegreeProgramTypeData(); //* step 2
    } else if (fieldName.trim() === 'Degree Program') {
      this.getCourseYearData(); //* step 4
    } else if (fieldName.trim() === 'Exam Type') {
      this.getSemester(); //* step 6
    }
    //  else if (fieldName.trim() === 'Exam Paper Type') {
    //   this.getSemester(); //* step 
    // } 
    else if (fieldName.trim() === 'Course Year') {
      this.getExamTypeData() //* step 5
    }
  }

  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession/', {}, 'academic')
      .subscribe((result: any) => {
        this.acadmcSesnList = (result.body.data || []).map((item: any) => ({
          id: item.academic_session_id,
          name: item.academic_session_name_e
        }));
      });
  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/', {}, 'academic')
      .subscribe((result: any) => {
        this.semesterList = (result.body.data || []).map((item: any) => ({
          id: item.semester_id,
          name: item.semester_name_e
        }));
      });
  }
  getDegreeProgramTypeData() {
    this.HTTP.getParam('/master/get/getDegreeProgramType/', {}, 'academic').subscribe((result: any) => {
      this.DegreeProgramTypeList = (result.body.data || []).map((item: any) => ({
        id: item.degree_programme_type_id,
        name: item.degree_programme_type_name_e
      }));
    });
  }

  getDegreePrograamData(degree_programme_type_id: number) {
    this.HTTP.getParam('/master/get/getDegreePrograam/', { degree_programme_type_id }, 'academic')
      .subscribe((result: any) => {
        this.tempDegreeProgrammeList = result.body.data || []
        this.degreePrograamList = (result.body.data || [])
          .map((item: any) => ({
            id: item.degree_id,
            name: item.degree_programme_name_e
          }));
      });
  }

  getCourseYearData() {
    this.HTTP.getParam('/master/get/getCourseYear/', {}, 'academic').subscribe((result: any) => {
      this.getCourseYearList = (result.body.data || []).map((item: any) => ({
        id: item.course_year_id,
        name: item.course_year_name_e
      }));
    });
  }

  getExamPaperTypeData() {
    this.HTTP.getParam('/master/get/getExamPaperType/', {}, 'academic').subscribe((result: any) => {
      this.getExamPaperTypeList = (result.body.data || []).map((item: any) => ({
        id: item.exam_paper_type_id,
        name: item.exam_paper_type_name_e
      }));
    });
  }

  getExamTypeData() {
    this.HTTP.getParam('/master/get/getExamType/', {}, 'academic').subscribe((result: any) => {
      this.getExamTypeList = (result.body.data || []).map((item: any) => ({
        id: item.exam_type_id,
        name: item.exam_type_name_e
      }));
    });
  }

  // ^ ---------------------------------------- ---  master method end
  //filed list create for input
  fildList = [
    { id: 1, name: 'Academic Session', required: true },
    { id: 2, name: 'Degree Programme Type', required: true },
    { id: 3, name: 'Degree Program', required: true },
    { id: 4, name: 'Course Year', required: true },
    { id: 5, name: 'Exam Type', required: true },
    { id: 6, name: 'Semester', required: true },
  ];

  // get option value 
  getOptions(fieldName: string) {
    switch (fieldName) {
      case 'Academic Session': return this.acadmcSesnList;
      case 'Degree Programme Type': return this.DegreeProgramTypeList;
      case 'Degree Program': return this.degreePrograamList;

      case 'Exam Type': return this.getExamTypeList;
      case 'Exam Paper Type': return this.getExamPaperTypeList;
      case 'Course': return this.coursesList;
      case 'Course Year': return this.getCourseYearList;

      case 'Semester': return this.semesterList;
      default: return [];
    }
  }

  resetForm(): void {
    this.TimeTableFiledFormGroup.reset()
  }

  private groupRowsNested(data: any[]) {
    // console.log("data : data =====================",data);
    const result: any = {};

    data.forEach(item => {
      const courseYearId = item.course_year_id;
      const semesterId = item.semester_id;
      const degreeProgrammeId = item.degree_programme_id;
      const examTypeId = item.exam_type_id;

      if (!result[courseYearId]) {
        result[courseYearId] = {};
      }
      if (!result[courseYearId][semesterId]) {
        result[courseYearId][semesterId] = {};
      }
      if (!result[courseYearId][semesterId][degreeProgrammeId]) {
        result[courseYearId][semesterId][degreeProgrammeId] = {};
      }
      if (!result[courseYearId][semesterId][degreeProgrammeId][examTypeId]) {
        result[courseYearId][semesterId][degreeProgrammeId][examTypeId] = [];
      }
      result[courseYearId][semesterId][degreeProgrammeId][examTypeId].push(item);
    });

    return result;
  }

  // Calculate total number of rows for a course_year_id (including nested)
  getGroupRowSpan(courseYearId: string, data: any): number {
    let count = 0;
    const semesters = data[courseYearId];
    for (const semesterId in semesters) {
      count += this.getSubGroupRowSpan(courseYearId, semesterId, data);
    }
    return count;
  }

  // Calculate total rows for a semester_id group
  getSubGroupRowSpan(courseYearId: string, semesterId: string, data: any): number {
    let count = 0;
    const degrees = data[courseYearId][semesterId];
    for (const degreeProgrammeId in degrees) {
      count += this.getSubSubGroupRowSpan(courseYearId, semesterId, degreeProgrammeId, data);
    }
    return count;
  }

  // Calculate total rows for a degree_programme_id group
  getSubSubGroupRowSpan(courseYearId: string, semesterId: string, degreeProgrammeId: string, data: any): number {
    let count = 0;
    const examTypes = data[courseYearId][semesterId][degreeProgrammeId];
    for (const examTypeId in examTypes) {
      count += examTypes[examTypeId].length;
    }
    return count;
  }


  getNameFromId(id: any, fieldName: string): string {
    const options = this.getOptions(fieldName);
    const match = options.find((opt: any) => opt.id == id);
    if (fieldName === 'Degree Program') {
      let tempData = this.tempDegreeProgrammeList.filter((data: any) => data.degree_programme_id == id)
        .map((data: any) => ({
          degree_programme_full_name_e: data.degree_programme_full_name_e
        }));
      return tempData[0]?.degree_programme_full_name_e;
    }
    return match ? match.name : id; // Fallback to id if not found
  }



  printData(): void {
    const htmlContent = this.print_content.nativeElement.innerHTML;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;

    if (!doc) {
      console.error("Failed to create iframe document for printing");
      return;
    }
    const currentDateTime = new Date().toLocaleString();
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Report</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            @page {
             margin: 5mm 6mm 10mm 6mm; /* top, right, bottom, left */
             counter-increment: page;
            }

            body {
              margin: 0;
              padding: 0;
            }

            .print-wrapper {
              padding: 5px;
            }

          /* Custom footer */
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10mm;
            font-size: 12px;
            color: #444;
          }

          .footer .datetime::before {
            content: "${currentDateTime}";
            margig-top: -2rem;
          }

          .footer .pagenum::before {
            content: counter(page);
          }
            .table {
              width: 100%;
              border-collapse: collapse;
            }

          .table-column-title th {
            background-color: rgb(8, 170, 146) !important;
            color: #fff !important;
           }

            .table-bordered th,
            .table-bordered td {
              border: 1px solid #dee2e6 !important;
              padding: 0.5rem;
            }
            
          thead>tr>td,
          thead>tr>th,
          .table-footer>td {
            font-size: 14px;
            text-align: left !important;
            font-weight: bold !important;
            text-decoration: none !important;
            border: 0.7px solid #5e5e5e;
            background-color: #eaebeb !important;
          }

            .text-center {
              text-align: center !important;
            }

            .fw-bold {
              font-weight: bold !important;
            }

            .mt-3 {
              margin-top: 1rem !important;
            }

            .mt-4 {
              margin-top: 1.5rem !important;
            }

            .mb-2 {
              margin-bottom: 0.5rem !important;
            }

            .mb-4 {
              margin-bottom: 1.5rem !important;
            }

            .m-1 {
              margin: 0.25rem !important;
            }

            .row {
              display: flex;
              flex-wrap: wrap;
            }

            .d-print-none {
              display: none !important;
            }
            .header-container {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .header-container .university-title {
              font-family: 'Georgia', serif;
              font-size: 24px;
              font-weight: bold;
              color: rgb(13, 181, 241);
              text-shadow: 1px 1px 1px 1px #000000;
              margin-left: 1rem;
            }

            img {
                width: 70px;
            }

            .header-container img.university-logo {
                width: 50px !important;
                height: 50px !important;
                object-fit: contain;
                display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <img src="logo.png" alt="logo" class="university-logo">
            <h1 class="university-title">Indira Gandhi Krishi Vishwavidyalaya, Raipur (C.G.)</h1>
          </div>
          <br/>
          <h5 class="text-center" style="margin-top: -27px !important;">Exam Time Table Report</h5>
          <div class="print-wrapper">
            ${htmlContent}
          </div>
        <div class="footer">
        </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Optional: Clean up
        document.body.removeChild(iframe);
      }, 300);
    };
  }


  getPdf(): void {
    const rawData = this.TimeTableFiledFormGroup.value;
    const allData = this.fildList.reduce((acc, field) => {
      acc[field.name] = rawData[field.id] || null;
      return acc;
    }, {} as any);
    let id = allData["Academic Session"];
    let academic_session = this.acadmcSesnList.filter((as: any) => as.id == id);
    let session = academic_session[0]?.name
    console.log("session : session", session);
    const html = this.print_content.nativeElement.innerHTML;
    this.HTTP.postBlob(`/file/post/htmltoPdf`, {
      html: html,
      // orientation: this.options.orientation
      title: `Exam Time Table Report ${session}`
    }, "Exam_Time_Table_Report", 'common').pipe(take(1)).subscribe(() => {
      // console.log("html to pdf");
    });
  }




}
