import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { AlertService, HttpService, PrintService, EsignService, LoaderService } from 'shared';
import { apiPort } from 'environment';

@Component({
  selector: 'app-result-notification',
  standalone: false,
  templateUrl: './result-notification.component.html',
  styleUrl: './result-notification.component.scss'
})
export class ResultNotificationComponent implements OnInit {
   @Input() options: any; // PDF or Print options
  state = {
    acadmicSessionList: [] as any[],
    semesterList: [] as any[],
    degreeProgrammeTypeList: [] as any[],
    degreeProgrammeList: [] as any[],
    examTypeList: [] as any[],
    valuationTypeList: [] as any[],
    matrixList: [] as any[],
    collegeDetailList: [] as any[],
  }
  resultNotificationReportFormGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  selectAll: boolean = true; // Default checked
  actionType: string = 'notGenerated'; //
  filePath: string = apiPort.fileUrl;
  random_id: number = Math.random();

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
    public esign: EsignService,
    private loaderService: LoaderService
  ) {
    this.resultNotificationReportFormGroup = this.fb.group({
      selection: this.fb.group({
        academic_session_id: ['', Validators.required],
        semester_id: ['', Validators.required],
        degree_programme_type_id: ['', Validators.required],
        degree_programme_id: ['', Validators.required],
        exam_type_id: ['', Validators.required],
        valuation_type_id: ['', Validators.required],
        course_year_id: [''],
        dean_committee_id: ['']
      }),
      resultDetails: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.getAcademicSession();
    this.getSemesterData();
    this.getDegreeProgrammeTypeData();
    this.getExamTypeData();
    this.getValuationTypeData();

    this.resultNotificationReportFormGroup.get('selection.academic_session_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(academicSessionId => {
        this.clearState([
          'matrixList',
          'collegeDetailList'
        ]);
        this.resetFormFields([
          'selection.course_year_id',
          'selection.dean_committee_id',
        ]);

      });

    this.resultNotificationReportFormGroup.get('selection.semester_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(semesterId => {
        this.clearState([
          'matrixList',
          'collegeDetailList'
        ]);
        this.resetFormFields([
          'selection.course_year_id',
          'selection.dean_committee_id',
        ]);
      });

    this.resultNotificationReportFormGroup.get('selection.degree_programme_type_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeTypeId => {
        this.clearState([
          'degreeProgrammeList',
          'matrixList',
          'collegeDetailList'
        ]);
        this.resetFormFields([
          'selection.degree_programme_id',
          'selection.dean_committee_id',
          'selection.course_year_id',
        ]);
        if (degreeProgrammeTypeId) {
          this.getDegreeProgrammeData(degreeProgrammeTypeId);
        }
      });

    this.resultNotificationReportFormGroup.get('selection.degree_programme_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(degreeProgrammeId => {
        this.clearState([
          'matrixList',
          'collegeDetailList'
        ]);
        this.resetFormFields([
          'selection.course_year_id',
          'selection.dean_committee_id',
        ]);
      });

    this.resultNotificationReportFormGroup.get('selection.exam_type_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(examTypeId => {
        this.clearState([
          'matrixList',
          'collegeDetailList'
        ]);
        this.resetFormFields([
          'selection.course_year_id',
          'selection.dean_committee_id',
        ]);
      });

    this.resultNotificationReportFormGroup.get('selection.valuation_type_id')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(examTypeId => {
        this.clearState([
          'matrixList',
          'collegeDetailList'
        ]);
        this.resetFormFields([
          'selection.course_year_id',
          'selection.dean_committee_id',
        ]);
      });
  }

  matrixTableOptions: any = {
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
    title: "Report Filter",
    payload: {
      // college_name_e: "SRI-Tech-I",
      // degree_programme_name_e: "Horticulture",
      // academic_session_name_e: "2024-25",
      // college_stream_name_e: "sjsjj sfjfn"
    }
  };

  generatedListOption: any = {
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
    pageSize: 15,
    title: ""
  };

  //* Step : 1
  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession1', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("acadmicSessionList : ", result);
          this.state.acadmicSessionList = result.body.data;
        },
        (error) => {
          console.error('Error in acadmicSessionList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  //* Step : 2
  getSemesterData() {
    this.http.getParam('/master/get/getSemesterList', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("semesterList : ", result.body.data);
          this.state.semesterList = result.body.data || [];
        },
        (error) => {
          console.error('Error in semesterList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  //* Step : 3
  getDegreeProgrammeTypeData() {
    this.http.getParam('/master/get/getDegreeProgramType', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("degreeProgrammeTypeList : ", result);
          this.state.degreeProgrammeTypeList = result.body.data;
        },
        (error) => {
          console.error('Error in degreeProgrammeTypeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  //* Step : 4
  getDegreeProgrammeData(degree_programme_type_id: number) {
    this.http.getParam('/master/get/getDegreePrograam', { degree_programme_type_id }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("degreeProgrammeList : ", result);
          this.state.degreeProgrammeList = result.body.data;
        },
        (error) => {
          console.error('Error in degreeProgrammeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  //* Step : 5
  getExamTypeData() {
    this.http.getParam('/master/get/getExamType', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("examTypeList : ", result);
          this.state.examTypeList = result.body.data;
        },
        (error) => {
          console.error('Error in examTypeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  //* Step : 6
  getValuationTypeData() {
    this.http.getParam('/master/get/getValuationType', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("valuationTypeList : ", result);
          // let tempData = result?.body?.data?.filter((data: any) => data.valuation_type_id === 1 || data.valuation_type_id === 2);
          this.state.valuationTypeList = result?.body?.data;
        },
        (error) => {
          console.error('Error in valuationTypeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  // * get reports data
  getDetailData(
    type: string,
    degree_programme_type_id: number,
    dean_committee_id: number,
    dean_committee_name_e: string,
    exam_type_id: number,
    valuation_type_id: number,
    academic_session_id: number,
    course_year_id: number,
    semester_id: number,
    degree_programme_id: number) {
    let opration = this.checkTypeForParam(type);
    this.http.getParam(`/markEntry/get/getExamResultNotificationList?${opration}`,
      {
        academic_session_id,
        degree_programme_id,
        exam_type_id,
        course_year_id,
        semester_id,
        valuation_type_id,
        degree_programme_type_id
      },
      'academic')
      .subscribe(
        (result: any) => {
          this.state.collegeDetailList = result?.body?.data || []
          // console.log("collegeDetailList : ", this.state.collegeDetailList);
          let array = this.resultNotificationReportFormGroup.get('resultDetails') as FormArray;
          if (array && array instanceof FormArray) {
            array.clear(); //! clear old data
          }
          // let array: any = []
          if (this.state.collegeDetailList.length === 0) {
            this.alert.alertMessage("No Records Found", "", "warning");
          } else if (type === 'notGenerated') {
            this.state.collegeDetailList.forEach((college: any) => {
              const group = this.fb.group({
                college_id: [college.college_id || null],
                college_name_e: [college.college_name_e || ''],
                notification_number: [''],
                notification_date: [''],
                dean_committee_id: [dean_committee_id],
                dean_committee_name_e: [dean_committee_name_e],
                selected: [true],
                remark: "Not Generated"
              });
              array.push(group);
            });
            this.generatedListOption.title = "Notification Not Generated Colleges"
          } else if (type === 'generated') {
            this.state.collegeDetailList.forEach((college: any) => {
              const group = this.fb.group({
                exam_result_notification_id: college.exam_result_notification_id || null,
                college_id: college.college_id || null,
                college_name_e: college.college_name_e || '',
                notification_number: college?.notification_number || '',
                notification_date: college?.notification_date || '',
                file_path: college?.file_path || '',
                is_published: college?.is_published || '',
                remark: college.is_published !== 'Y' ? college.is_notification_signed === 'Y' ? "E-Sign Done" : "" : ""
              });
              array.push(group);
            });
            this.generatedListOption.title = "List of Generated Notification"
          } else if (type === 'notSigned') {
            this.state.collegeDetailList.forEach((college: any) => {
              const group = this.fb.group({
                exam_result_notification_id: [college.exam_result_notification_id || null],
                college_id: [college.college_id || null],
                college_name_e: [college.college_name_e || ''],
                notification_number: [college.notification_number || ''],
                notification_date: [college.notification_date || ''],
                file_path: [college?.file_path || ''],
                selected: [true],
                remark: college.is_published !== 'Y' ? "E-Sign Penging" : ""
              });
              array.push(group);
            });
            this.generatedListOption.title = "List of not Signed Notification";
          } else if (type === 'signed') {
            this.state.collegeDetailList.forEach((college: any) => {
              const group = this.fb.group({
                exam_result_notification_id: college.exam_result_notification_id || null,
                college_id: college.college_id || null,
                college_name_e: college.college_name_e || '',
                notification_number: college?.notification_number || '',
                notification_date: college?.notification_date || '',
                is_published: college?.is_published || '',
                file_path: college?.file_path || '',
                remark: college.is_published !== 'Y' ? "Publish Pending" : ""
              });
              array.push(group);
            });
            this.generatedListOption.title = "List of Signed Notification"
          } else if (type === 'notPublished') {
            this.state.collegeDetailList.forEach((college: any) => {
              const group = this.fb.group({
                exam_result_notification_id: college.exam_result_notification_id || null,
                college_id: college.college_id || null,
                college_name_e: college.college_name_e || '',
                notification_number: college?.notification_number || '',
                notification_date: college?.notification_date || '',
                file_path: college?.file_path || '',
                selected: [true],
                remark: "Publish Pending"
              });
              array.push(group);
            });
            this.generatedListOption.title = "List of not Published Notification"
          } else if (type === 'published') {
            this.state.collegeDetailList.forEach((college: any) => {
              const group = this.fb.group({
                exam_result_notification_id: college.exam_result_notification_id || null,
                college_id: college.college_id || null,
                college_name_e: college.college_name_e || '',
                notification_number: college?.notification_number || '',
                notification_date: college?.notification_date || '',
                file_path: college?.file_path || '',
              });
              array.push(group);
            });
            this.generatedListOption.title = "List of Published Notification"
          }
          this.generatedListOption.dataSource = this.resultNotificationReportFormGroup.get('resultDetails')?.value;
          this.generatedListOption.listLength = this.resultNotificationReportFormGroup.get('resultDetails')?.value?.length
        },
        (error) => {
          console.error('Error in collegeDetailList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  checkTypeForParam(type: string) {
    switch (type) {

      case "notGenerated":
        return "not_generated=1";

      case "generated":
        return "is_declared=Y";

      case "notSigned":
        return "is_notification_signed=N";

      case "signed":
        return "is_notification_signed=Y";

      case "notPublished":
        return "is_published=N";

      case "published":
        return "is_published=Y";

      default:
        return "";
    }
  }

  getDetails_click() {
    this.actionType = '';
    this.generatedListOption.dataSource = [];
    this.generatedListOption.length = 0
    let {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      degree_programme_id,
      valuation_type_id,
      exam_type_id
    } = this.resultNotificationReportFormGroup.get('selection')?.value;
    if (
      academic_session_id && exam_type_id &&
      semester_id && valuation_type_id &&
      degree_programme_type_id && degree_programme_id) {
      this.getMatrixData(
        academic_session_id,
        semester_id,
        degree_programme_id,
        valuation_type_id,
        exam_type_id
      );
    } else {
      this.alert.alertMessage("Please select all fields", "", "warning");
    }
  }

  getDetail_btn(item: any, type?: string) {
    let { dean_committee_id, dean_committee_name_e, course_year_id } = item

    this.resultNotificationReportFormGroup.get('selection')?.patchValue({
      dean_committee_id,
      course_year_id
    });

    let {
      academic_session_id,
      semester_id,
      degree_programme_type_id,
      degree_programme_id,
      exam_type_id,
      valuation_type_id
    } = this.resultNotificationReportFormGroup.get('selection')?.value;
    // this.resultNotificationReportFormGroup.get('resultDetail.course_nature_id')?.setValue(item.course_nature_id);

    switch (type) {
      case 'notGenerated':
        this.actionType = 'notGenerated';
        // this.getCollegeDetailData('notGenerated', degree_programme_type_id, dean_committee_id, dean_committee_name_e);
        this.getDetailData('notGenerated',
          degree_programme_type_id,
          dean_committee_id,
          dean_committee_name_e,
          exam_type_id,
          valuation_type_id,
          academic_session_id,
          course_year_id,
          semester_id,
          degree_programme_id);
        break;
      case 'generated':
        this.actionType = 'generated';
        this.getDetailData('generated',
          degree_programme_type_id,
          dean_committee_id,
          dean_committee_name_e,
          exam_type_id,
          valuation_type_id,
          academic_session_id,
          course_year_id,
          semester_id,
          degree_programme_id
        );
        // this.alert.alertMessage("Feature will be activated soon", "", "warning");
        break;
      case 'notSigned':
        this.actionType = 'notSigned';
        this.getDetailData('notSigned',
          degree_programme_type_id,
          dean_committee_id,
          dean_committee_name_e,
          exam_type_id,
          valuation_type_id,
          academic_session_id,
          course_year_id,
          semester_id,
          degree_programme_id
        );
        break;
      case 'signed':
        this.actionType = 'signed';
        this.getDetailData('signed',
          degree_programme_type_id,
          dean_committee_id,
          dean_committee_name_e,
          exam_type_id,
          valuation_type_id,
          academic_session_id,
          course_year_id,
          semester_id,
          degree_programme_id
        );
        break;
      case 'notPublished':
        this.actionType = 'notPublished';
        this.getDetailData('notPublished',
          degree_programme_type_id,
          dean_committee_id,
          dean_committee_name_e,
          exam_type_id,
          valuation_type_id,
          academic_session_id,
          course_year_id,
          semester_id,
          degree_programme_id
        );
        break;
      case 'published':
        this.actionType = 'published';
        this.getDetailData('published',
          degree_programme_type_id,
          dean_committee_id,
          dean_committee_name_e,
          exam_type_id,
          valuation_type_id,
          academic_session_id,
          course_year_id,
          semester_id,
          degree_programme_id
        );
        break;
      default:
        this.actionType = '';
        break;
    }
  }

  resetFormFields(fields: string[]) {
    fields.forEach(path => {
      const control = this.resultNotificationReportFormGroup.get(path);
      if (control) {
        control.reset();
      }
    });
  }

  clearState(keys: (keyof typeof this.state)[]): void {
    keys.forEach(key => this.state[key] = []);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  getMatrixData(
    academic_session_id: number,
    semester_id: number,
    degree_programme_id: number,
    valuation_type_id: number,
    exam_type_id: number
  ) {
    this.http.getParam('/markEntry/get/getDashboardForExamResultNotification', {
      academic_session_id,
      semester_id,
      degree_programme_id,
      valuation_type_id,
      exam_type_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "Result Notification Generated.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else if (result?.body?.data?.length > 0) {
            let data = result?.body?.data || [];
            this.state.matrixList = data;
            this.matrixTableOptions.dataSource = this.state.matrixList;
            this.matrixTableOptions.listLength = this.state.matrixList.length
          } else {
            this.alert.alertMessage("No Records Found", "", "warning");
          }
        },
        (error) => {
          console.error('Error in matrixList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      );
  }

  onToggleSelectAll(isChecked: boolean): void {
    const array = this.resultNotificationReportFormGroup.get('resultDetails') as FormArray;
    array.controls.forEach((group: any) => {
      group.get('selected')?.setValue(isChecked);
    });
    this.selectAll = isChecked;
  }

  onSubmitGenerateNotification() {
    let collegeDetails = this.resultNotificationReportFormGroup.get('resultDetails')?.value;
    let selection = this.resultNotificationReportFormGroup.get("selection")?.value;
    let selectedCollegeDetails = collegeDetails
      .filter((college: any) => college.selected === true)
      .map((college: any) => ({
        academic_session_id: selection.academic_session_id,
        semester_id: selection.semester_id,
        degree_programme_type_id: selection.degree_programme_type_id,
        degree_programme_id: selection.degree_programme_id,
        exam_type_id: selection.exam_type_id,
        valuation_type_id: selection.valuation_type_id,
        college_id: college.college_id,
        notification_number: college.notification_number,
        notification_date: college.notification_date,
        dean_committee_id: selection.dean_committee_id,
        course_year_id: selection.course_year_id,
        is_published: 'N'
      }));

    let selectedCollege = collegeDetails.filter((collegeDetail: any) => collegeDetail.college_id === selectedCollegeDetails[0]?.college_id);
    let academicSession = this.state.acadmicSessionList.filter((academicS: any) => academicS.academic_session_id === selection.academic_session_id);
    let examType = this.state.examTypeList.filter((examT: any) => examT.exam_type_id === selection.exam_type_id);
    let valuationType = this.state.valuationTypeList.filter((valT: any) => valT.valuation_type_id === selection.valuation_type_id);
    let payload = {
      data: selectedCollegeDetails,
      dean_committee_name_e: selectedCollege[0]?.dean_committee_name_e,
      academic_session_name_e: academicSession[0]?.academic_session_name_e,
      exam_type_name_e: examType[0]?.exam_type_name_e,
      exam_type_id: selection.exam_type_id,
      valuation_type_id: selection.valuation_type_id,
      valuation_type_name_e: valuationType[0].valuation_type_name_e
    }
    // console.log("payload---------s-payload---------------------");
    // console.log("payload :", payload);
    this.http.postData('/markEntry/post/generateResultNotification', payload, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("generateResultNotification====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "Result Notification Generated.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getDetails_click(); //^ reload page
        },
        (error) => {
          console.error('Error in generateResultNotification:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  async onDeleteRow(row: any) {
    // Show confirmation dialog
    const result = await this.alert.confirmAlert(
      "Are you sure you want to delete this record?",
      '',
      "question"
    );
    if (!result.value) {
      // User clicked "No" or dismissed the modal
      return;
    }

    let payload = {
      exam_result_notification_id: row?.exam_result_notification_id
    }
    this.http.deleteData('/markEntry/delete/deleteExamResultNotification', payload, 'academic')
      .subscribe((result: any) => {
        const details = result?.body?.error?.details;

        if (!result.body.error) {
          this.getDetails_click(); //^ reload page
          this.alert.alertMessage(result?.body?.data?.message || "Result Notification Deleted Successfully!!", "", "success");
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

  async onSubmitGenerateESign(type: string) {
    let collegeDetails = this.resultNotificationReportFormGroup.get('resultDetails')?.value;
    let selection = this.resultNotificationReportFormGroup.get("selection")?.value;
    let academicSession = this.state.acadmicSessionList.filter(
      (academicS: any) => academicS.academic_session_id === selection.academic_session_id
    );

    let valuation_type_id = selection.valuation_type_id

    if (type === "notSigned") {
      // ✅ Run setup ONCE before all colleges
      await this.esign.setupEDS(valuation_type_id === 1 ? 1 : 2); // moduleid = 1
    }

    // Get all selected colleges
    let selectedColleges = collegeDetails.filter((college: any) => college.selected === true);
    let selectedCollegeDetails;
    if (type === "notSigned") {
      // Wait for all callEsignService() calls to complete
      this.loaderService.show();
      selectedCollegeDetails = await Promise.all(
        selectedColleges.map(async (college: any) => {
          const filePath = await this.esign.callEsignService(this.filePath + college.file_path);
          return {
            exam_result_notification_id: college.exam_result_notification_id,
            academic_session_id: selection.academic_session_id,
            semester_id: selection.semester_id,
            degree_programme_type_id: selection.degree_programme_type_id,
            degree_programme_id: selection.degree_programme_id,
            exam_type_id: selection.exam_type_id,
            valuation_type_id: selection.valuation_type_id,
            college_id: college.college_id,
            notification_number: college.notification_number,
            notification_date: college.notification_date,
            dean_committee_id: selection.dean_committee_id,
            course_year_id: selection.course_year_id,
            file_path: filePath,
            file_name: college.file_path
          };
        })
      );
      this.loaderService.hide();
      this.esign.resetEsignState();
    } else {
      selectedCollegeDetails = await Promise.all(selectedColleges.map(async (college: any) => {
        return {
          exam_result_notification_id: college.exam_result_notification_id,
          academic_session_id: selection.academic_session_id,
          semester_id: selection.semester_id,
          degree_programme_type_id: selection.degree_programme_type_id,
          degree_programme_id: selection.degree_programme_id,
          exam_type_id: selection.exam_type_id,
          valuation_type_id: selection.valuation_type_id,
          college_id: college.college_id,
          notification_number: college.notification_number,
          notification_date: college.notification_date,
          dean_committee_id: selection.dean_committee_id,
          course_year_id: selection.course_year_id,
          file_path: college.file_path
        };
      })
      );
    }

    // Pick a selected college (for additional info)
    let selectedCollege = collegeDetails.filter(
      (collegeDetail: any) => collegeDetail.college_id === selectedCollegeDetails[0]?.college_id
    );

    let payload = {
      data: selectedCollegeDetails,
      dean_committee_name_e: selectedCollege[0]?.dean_committee_name_e,
      academic_session_name_e: academicSession[0]?.academic_session_name_e,
    };

    // console.log("Posting type:", type, "Payload:", payload);
    const postDataMap: any = {
      notGenerated: "generateResultNotification", // post
      notSigned: "esignResultNotification", // put
      notPublished: "publishResultNotification", // put
    };
    const methodName = postDataMap[type];

    if (methodName === "generateResultNotification") {
      // console.log("payload ---->> ", payload);
      this.http.postData(`/markEntry/post/${methodName}`, payload, 'academic')
        .subscribe(
          (result: any) => {
            // console.log("generateResultNotification====<<<<S : ", result?.body);
            if (result?.body?.data?.message) {
              this.alert.alertMessage(result.body.data.message || "Result Notification Generated.", "", "success")
            } else if (result?.body?.error?.message) {
              this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
            } else if (result?.body?.error) {
              this.alert.alertMessage(result?.body?.error || "", "", "error");
            } else {
              this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
            }
            this.getDetails_click(); //^ reload page
          },
          (error) => {
            console.error('Error in valuationTypeList:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          });
    } else {
      // console.log("payload ====>> ", payload);
      this.http.putData(`/markEntry/update/${methodName}`, payload, 'academic')
        .subscribe(
          (result: any) => {
            // console.log("generateResultNotification====<<<<S : ", result?.body);
            if (result?.body?.data?.message) {
              this.alert.alertMessage(result.body.data.message || "Result Notification Updated.", "", "success")
            } else if (result?.body?.error?.message) {
              this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
            } else if (result?.body?.error) {
              this.alert.alertMessage(result?.body?.error || "Error", "", "error");
            } else {
              this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
            }
            this.getDetails_click(); //^ reload page
          },
          (error) => {
            console.error('Error in valuationTypeList:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          });
    }
  }



}
