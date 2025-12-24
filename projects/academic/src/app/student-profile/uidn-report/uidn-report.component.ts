import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, EsignService, HttpService, LoaderService } from 'shared';
import { environment, apiPort } from 'environment';

@Component({
  selector: 'app-uidn-report',
  standalone: false,
  templateUrl: './uidn-report.component.html',
  styleUrl: './uidn-report.component.scss'
})
export class UidnReportComponent implements OnInit {
  // file_prefix: string = environment.filePrefix;
  file_prefix: string = apiPort.fileUrl;
  
  generateUIDNFormGroup!: FormGroup
  acadmcSesnList: any;
  collegeList: any;
  degreeList: any;
  reportList: any = [];
  selectedDegree: any;
  selectAll = false;

  constructor(
    private fb: FormBuilder,
    private HTTP: HttpService,
    private alert: AlertService,
    public esign: EsignService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.generateUIDN();
    this.getCollegeData();
    this.getAcademicSession();
  }

  uidnReportListOptions: any = {
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
    pageSize: 50,
    title: "UIDN Approved Report"
  };

  generateUIDN() {
    this.generateUIDNFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      college_id: ['', Validators.required],
      degree_id: ['', Validators.required],

      approvedList: this.fb.array([])   // <– FormArray like previous code
    });
  }

  get approvedList(): FormArray {
    return this.generateUIDNFormGroup.get('approvedList') as FormArray;
  }


  // * get academic session
  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession/', {}, 'academic')
      .subscribe((result: any) => {
        // console.log('session', result);
        this.acadmcSesnList = result.body.data;
      });
  }

  // * get college 
  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList/', {}, 'academic')
      .subscribe((result: any) => {
        // console.log(result);
        this.collegeList = result.body.data;
      })
  }

  onCollegeChange(college_id: number) {
    this.getDegree(college_id);
  }

  // * get degree
  getDegree(college_id: number) {
    this.HTTP.getParam('/master/get/getDegreeByDegPrgTyp', { college_id }, 'academic')
      .subscribe((result: any) => {
        this.degreeList = result.body.data;
      });
  }

  // * get report list
  getUIDNReportList() {
    const { academic_session_id, college_id, degree_id } = this.generateUIDNFormGroup.value;
    const payload = {
      academic_session_id,
      college_id,
      degree_id
    };
    if (
      !payload.academic_session_id ||
      !payload.college_id ||
      !payload.degree_id
    ) {
      this.alert.alertMessage(
        "All Fields are Required.",
        "Please select All Fields",
        "warning"
      );
      return; // Stop execution
    }
    this.HTTP.getParam('/studentProfile/get/getUIDNReportList', payload, 'academic').subscribe((result: any) => {
      this.reportList = result?.body?.data;

      this.approvedList.clear();

      if (this.reportList.length === 0) {
        this.alert.alertMessage(
          "No Records Found",
          "First Approve UIDN",
          "warning"
        );
      } else {
        this.uidnReportListOptions.dataSource = this.reportList || [];
        this.uidnReportListOptions.listLength = this.reportList.length;

        this.reportList.forEach((row: any) => {
          this.approvedList.push(this.createReportListRow(row));
        });
      }
    });
  }

  // ~ create form
  createReportListRow(row: any): FormGroup {
    return this.fb.group({
      selected: [false],

      academic_orders_id: [row.academic_orders_id],
      approval_round: [row.uidapproval_roundn],
      is_certificate_signed: [row.is_certificate_signed],
      file_path: [row.file_path],
    });
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.approvedList.controls.forEach(ctrl => {
      ctrl.get('selected')?.setValue(checked);
    });
  }

  onRowCheckboxChange() {
    const allSelected = this.approvedList.controls.every(c => c.get('selected')?.value);
    this.selectAll = allSelected;
  }

  // ! E-Sign in UIDN Report
  async submitSelectedForEsign() {
    const selectedRows = this.approvedList.value.filter((r: any) => r.selected);
    if (selectedRows.length === 0) {
      this.alert.alertMessage(
        "⚠️ No Record Selected",
        "Atleast select one record",
        "warning"
      );
      return;
    }

    // ! start------------------ esign call -------------------------------------------------------
    // moduleid => UIDN Allotment = 28
    // ✅ Run setup ONCE before all colleges
    await this.esign.setupEDS(28); // moduleid from table dsc_modules

    // Wait for all callEsignService() calls to complete
    this.loaderService.show();
    let selectedReport: any = await Promise.all(
      selectedRows.map(async (report: any) => {
        const filePath = await this.esign.callEsignService(this.file_prefix + report.file_path);
        return {
          academic_orders_id: report.academic_orders_id,
          file_path: filePath,
          file_name: report.file_path,
          is_certificate_signed: 'Y',
        };
      })
    );
    this.loaderService.hide();
    this.esign.resetEsignState();
    // ! ------------------ esign call ---------------------------------------------------------end



    console.log("selectedReport-s--d-s-d----->>> ", selectedReport);
    this.HTTP.postData('/studentProfile/post/uidnReportEsign', { reportList: selectedReport }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("uidnReportEsign====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "UIDN E-Sign Done.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getUIDNReportList(); //^ reload page
        },
        (error) => {
          console.error('Error in uidnReportEsign:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const d = new Date(dateString);

    if (isNaN(d.getTime())) return dateString; // fallback

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear(); // full 4-digit year

    return `${day}-${month}-${year}`;
  }

  downloadAllReport() {
    this.alert.alertMessage("‘Download All’ will be available soon.", "", "info");
  }


}
