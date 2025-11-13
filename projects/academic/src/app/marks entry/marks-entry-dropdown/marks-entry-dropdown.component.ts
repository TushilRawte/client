import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpService } from 'shared'; 


@Component({
  selector: 'app-marks-entry-dropdown',
  standalone: false,
  templateUrl: './marks-entry-dropdown.component.html',
  styleUrl: './marks-entry-dropdown.component.scss'
})
export class MarksEntryDropdownComponent implements OnInit {
  @Input() formGroup!: FormGroup; // parent form
  @Input() showDegreeProgramme: boolean = true;
  @Input() showCollege: boolean = true;
  @Input() showAcademicSession: boolean = true;
  @Input() showYear:boolean = true
  @Input() showSemester:boolean = true
  @Input() showvaluation:boolean = true
  @Input() showExamType : boolean = true
  @Input() showExamPaper:boolean = true
  @Input() showDeanCommitee:boolean = false


  @Output() collegeChange = new EventEmitter<any>();
  @Output() degreeProgrammeChange = new EventEmitter<any>();
  @Output() examPaperTypeChange = new EventEmitter<any>();
  @Output() examValuationChange = new EventEmitter<any>()

  acadmcSesnList: any[] = [];
  collegeList: any[] = [];
  degreeProgrammeList: any[] = [];
  degreeProgramme: any;
  yearList: any;
  semesterList: any;
  valuationTypeList: any;
  examTypeList: any;
  getExamPaperTypeList: any;
  getDeanCommiteeList: any;

  constructor(private HTTP: HttpService) {}
ngOnInit(): void {
  console.log('✅ CommonDropdownsComponent loaded');
  this.getAcademicSession();
  this.getCollegeData();
  this.getYearData();
  this.getSemester();
  this.getValuationType();
  this.getExamType();
  this.getExamPaperType();
  this.getDeanCommitee();
}

  // ✅ Dropdown API calls (using your same HTTP pattern)
    getAcademicSession(){
      this.HTTP.getParam('/master/get/getAcademicSession1/', {}, 'academic').subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data;
    });
  }
    getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList1/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.collegeList = result.body.data;
    })
  }

 onCollegeChange(event: any) {
    const college_id = event;
    this.collegeChange.emit(college_id); // optional for parent

    // fetch degree programmes for this college
    this.HTTP.getParam('/master/get/getDegreePrograamList/', { college_id }, 'academic')
      .subscribe((res: any) => {
        this.degreeProgrammeList = res.body.data || [];

        // Add extra hardcoded programmes for college_id = 5
        if (college_id === 5) {
          this.degreeProgrammeList.push(
            { degree_programme_id: 14, degree_programme_name_e: "M.Sc.(Ag.) (PGS)", degree_id: 12, subject_id: 139 },
            { degree_programme_id: 37, degree_programme_name_e: "Ph.D in Agriculture (PGS)", degree_id: 5, subject_id: 139 }
          );
        }

        // reset degree programme selection in the form
        this.formGroup.get('degree_programme_id')?.reset();
      });
  }

  getYearData() {
    this.HTTP.getParam('/master/get/getCourseYearList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.yearList = result.body.data;
    })
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

    getExamPaperType() {
    this.HTTP.getParam('/master/get/getExamPaperType/',{} ,'academic').subscribe((result:any) => {
      this.getExamPaperTypeList = result.body.data;
      // console.log(this.getExamPaperTypeList);
    })
  }

      getDeanCommitee() {
    this.HTTP.getParam('/master/get/getDeanCommitee/',{} ,'academic').subscribe((result:any) => {
      this.getDeanCommiteeList = result.body.data;
      // console.log('Course Year List:', this.getDeanCommiteeList);
    })
  }

onDegreeProgrammeChange(degree_programme_id: number) {
  const selected = this.degreeProgrammeList.find(p => p.degree_programme_id === degree_programme_id);
  this.degreeProgrammeChange.emit(selected);
   
}

onExamPaperTypeChange(selected: any) {
  if (!selected) return;
  console.log('Selected exam paper type:', selected);
  this.examPaperTypeChange.emit(selected);
}

onValuationTypeChange(selected: any) {
  if (!selected) return;
  console.log('Valuation type:', selected);
  this.examValuationChange.emit(selected);
}



}