import { Component, OnInit } from '@angular/core'; // Import OnInit
import { HttpService, AlertService, PrintService } from 'shared';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-teacher-allotment',
  standalone: false,
  templateUrl: './teacher-allotment.component.html',
  styleUrl: './teacher-allotment.component.scss'
})
export class TeacherAllotmentComponent implements OnInit{

  acadmcSesnList: any = [];
  collegeList: any = [];
  degreeProgramme: any = [];
  semesterList: any = [];
  courseYearList: any = [];
  courseTypeList: any = [];
  courseAllotType: any = [];
  courseList: any = [];
  finalizecourseFormGroup!: FormGroup;
  selectedCourseData: any;
  currentData: any;
  selectedCourseYearId: any;
  printDash: any;
  isFinalized: boolean = false;
  teacherList: any[] = [];
  print_row: any[] = [];
  selectedTeachersByCourse: { [key: number]: number[] } = {};
  courseForm: any;

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService
  ) {}


  ngOnInit(): void {
    // Add : void for clarity
    this.getAcademicSession();
    this.getCollegeData();
    this.getSemester();
    this.getCourseList();
    this.getCourseType();
    this.getCourseAllotType();
    this.finalizeCourseForm();
    this.getTeacherListForCrsAlt()
  }

  finalizeCourseForm() {
    this.finalizecourseFormGroup = this.fb.group({
      Academic_Session_Id: ['', Validators.required],
      college_id: ['', Validators.required],
      Degree_Programme_Id: ['', Validators.required],
      Semester_Id: ['', Validators.required],
      // deanCommittee: [null, Validators.required],
      Course_Id: ['', Validators.required],
      Course_Type_Id: ['', Validators.required],
      Cou_Allot_Type_Id: ['', Validators.required],
      Course_Nature: [''],  // Add this for display
      Total_Credit: [''],    // Add this for display
      Emp_Id: [[], Validators.required], // For multiple teachers
      courseRows: this.fb.array([])
    });
  }

    // Getter for formArray
get courseRows(): FormArray {
  return this.finalizecourseFormGroup.get('courseRows') as FormArray;
}

getTeacherArray(row: AbstractControl): any[] {
  // Try both possible control names
  const teachersControl = row.get('teacherRows') || row.get('Teachers');
  return teachersControl ? (teachersControl as FormArray).value : [];
}


  getAcademicSession() {
    this.HTTP.getParam(
      '/master/get/getAcademicSession/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.acadmcSesnList = result.body.data;
    });
  }

  getCollegeData() {
    this.HTTP.getParam(
      '/master/get/getCollegeList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.collegeList = result.body.data;
    });
  }

  onCollegeChange(college_id: number) {
    console.log('Selected College ID:', college_id);
    this.getDegreeProgramme(college_id); // pass the selected ID
  }

  getDegreeProgramme(college_id: number) {
    this.HTTP.getParam(
      '/master/get/getDegreeProgramme/',
      { college_id },
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.degreeProgramme = result.body.data;
    });
  }

  getSemester() {
    this.HTTP.getParam(
      '/master/get/getSemesterList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.semesterList = result.body.data;
    });
  }

  onDegreeProgrammeChange(Degree_Programme_Id: number) {
    const selected = this.degreeProgramme.find(
      (p: { Degree_Programme_Id: number }) =>
        p.Degree_Programme_Id === Degree_Programme_Id
    );
    const degree_id = selected?.degree_id;
    console.log('degree_id to send:', degree_id);
    this.getCourseYearList(degree_id);
  }

  getCourseYearList(Degree_Id: number) {
    this.HTTP.getParam(
      '/master/get/getDegreewiseCourseYearList/',
      { Degree_Id },
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.courseYearList = result.body.data;
    });
  }

  getCourseList() {
    this.HTTP.getParam(
      '/master/get/getCourseForAllot/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.courseList = result.body.data;
    });
  }
  getTeacherListForCrsAlt() {
    this.HTTP.getParam('/master/get/getTeacherForCrsAlt/',{} ,'academic').subscribe((result:any) => {
      console.log(result);
      this.teacherList = result.body.data;
    })
  }

  getCourseType() {
    this.HTTP.getParam(
      '/master/get/getCourseTypeList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.courseTypeList = result.body.data;
    });
  }

  getCourseAllotType() {
    this.HTTP.getParam(
      '/master/get/getCourseAllotmentTypeList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.courseAllotType = result.body.data;
    });

 
  

    
  }

  getDataForPrint(item: any) {
    this.openCourseGeneral(item);
    this.isFinalized= true;
    const formValue = this.finalizecourseFormGroup.value;
    const sessionObj = this.acadmcSesnList.find(
      (s: { Academic_Session_Id: any }) =>
        s.Academic_Session_Id === formValue.Academic_Session_Id
    );
    const collegeObj = this.collegeList.find(
      (c: { college_id: any }) => c.college_id === formValue.college_id
    );
    const programmeObj = this.degreeProgramme.find(
      (p: { Degree_Programme_Id: any }) =>
        p.Degree_Programme_Id === formValue.Degree_Programme_Id
    );
    const semesterObj = this.semesterList.find(
      (s: { Semester_Id: any }) => s.Semester_Id === formValue.Semester_Id
    );

    this.printDash = this.selectedCourseData = {
      session: sessionObj?.Academic_Session_Name_E || '',
      college: collegeObj?.College_name_E || '',
      programme: programmeObj?.Degree_Programme_Name_E || '',
      semester: semesterObj?.Semester_Name_E || '',
      semester_id: semesterObj?.Semester_Id || null,
      deanCommittee: item.Dean_Commite_Name_E,
      deanCommittee_id: item.Dean_Committee_Id,
      batch: 'Batch I & II',
      Course_Year_ID: item.Course_Year_ID,
      Course_Year_Name_E: item.Course_Year_Name_E,
    };
    if (
      !formValue.Academic_Session_Id ||
      !formValue.college_id ||
      !formValue.Degree_Programme_Id ||
      !formValue.courseYear?.Course_Year_ID ||
      !formValue.Semester_Id ||
      !formValue.deanCommittee?.Dean_Committee_Id
    ) {
      // alert('Please fill all required fields before Print.');
      return;
    }
    const params = {
      Academic_Session_Id: formValue.Academic_Session_Id,
      College_Id: formValue.college_id,
      Degree_Programme_Id: formValue.Degree_Programme_Id,
      Course_Year_Id: formValue.courseYear?.Course_Year_ID,
      Semester_Id: formValue.Semester_Id,
      Dean_Committee_Id: formValue.deanCommittee?.Dean_Committee_Id,
    };
    this.HTTP.getParam(
      '/master/get/getCourseForUpdate/',
      params,
      'academic'
    ).subscribe(
      (result: any) => {
        console.log('Full API Response:', result);

        if (
          result.body?.data?.courseRows &&
          result.body.data.courseRows.length > 0
        ) {
          console.log('Data found:', result.body?.data?.courseRows);
          this.print_row = result.body?.data?.courseRows;
          this.print_row = result.body?.data?.courseRows.map((course: { selectedEmpIds: any; teacherRows: any[]; }) => {
            course.selectedEmpIds = course.teacherRows.map(t => t.Emp_Id);
            return course;
          });
          // ------------------
          const courseRows = result.body?.data?.courseRows || [];

          const courseFormGroups = courseRows.map((course: { teacherRows: any[]; }) =>
            this.fb.group({
              ...course,
              Emp_Id: [course.teacherRows.map(t => t.Emp_Id)] // multiple teachers
            })
          );
          
          this.courseForm = this.fb.group({
            courses: this.fb.array(courseFormGroups)
          });
  
          
          // this.populateCourseTable(result.body?.data?.courseRows);
        } else {
          alert('No previous year allotment data found.');
        }
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
  }

  compareByEmpIdObject = (a: any, b: any) => {
    return a && b && a.Emp_Id === b.Emp_Id;
  };
  onTeacherChange(selectedEmpIds: number[], course: any) {
    course.teacherRows = this.teacherList.filter(t => selectedEmpIds.includes(t.Emp_Id));
  }
  get coursesFormArray(): FormArray {
    return this.courseForm?.get('courses') as FormArray;
  }
  
  

  // Extract selected teacher IDs from teacherRows
getSelectedEmpIds(teacherRows: any[]): number[] {
  return teacherRows.map(t => t.Emp_Id);
}


  openCourseGeneral(item: any): void {
    console.log('Selected item:', item);
    const formValue = this.finalizecourseFormGroup.value;
    this.finalizecourseFormGroup.patchValue({
      deanCommittee: {
        Dean_Committee_Id: item.Dean_Committee_Id,
      },
      courseYear: {
        Course_Year_ID: item.Course_Year_ID,
      },
    });

    const sessionObj = this.acadmcSesnList.find(
      (s: { Academic_Session_Id: any }) =>
        s.Academic_Session_Id === formValue.Academic_Session_Id
    );
    const collegeObj = this.collegeList.find(
      (c: { college_id: any }) => c.college_id === formValue.college_id
    );
    const programmeObj = this.degreeProgramme.find(
      (p: { Degree_Programme_Id: any }) =>
        p.Degree_Programme_Id === formValue.Degree_Programme_Id
    );
    const semesterObj = this.semesterList.find(
      (s: { Semester_Id: any }) => s.Semester_Id === formValue.Semester_Id
    );

    this.currentData = this.selectedCourseData = {
      session: sessionObj?.Academic_Session_Name_E || '',
      college: collegeObj?.College_name_E || '',
      programme: programmeObj?.Degree_Programme_Name_E || '',
      semester: semesterObj?.Semester_Name_E || '',
      semester_id: semesterObj?.Semester_Id || null,
      deanCommittee: item.Dean_Commite_Name_E,
      deanCommittee_id: item.Dean_Committee_Id,
      batch: 'Batch I & II',
      Course_Year_ID: item.Course_Year_ID,
      Course_Year_Name_E: item.Course_Year_Name_E,
    };

    const params = {
      Academic_Session_Id: formValue.Academic_Session_Id,
      College_Id: formValue.college_id,
      Degree_Programme_Id: formValue.Degree_Programme_Id,
      Semester_Id: formValue.Semester_Id,
      Dean_Commite_Id: item.Dean_Committee_Id,
      Course_Year_Id: item.Course_Year_ID,
    };

    this.HTTP.getParam(
      '/master/get/getCourseForUpdate/',
      params,
      'academic'
    ).subscribe(
      (result: any) => {
        console.log('Full API Response:', result);

        if (
          result.body?.data?.courseRows &&
          result.body.data.courseRows.length > 0
        ) {
          console.log('Data found:', result.body?.data?.courseRows);
          this.print_row = result.body?.data?.courseRows;
          this.print_row.forEach((course: { teacherIds: any; teacherRows: { map: (arg0: (t: any) => any) => never[]; }; }) => {
            course.teacherIds = course.teacherRows?.map(t => t.Emp_Id) || [];
          });
        } else {
          alert('No Course Alloted.');
        }
      },
      (error) => {
        console.error('API Error:', error);
      }
    );
    this.selectedCourseYearId = item.Course_Year_ID;
    
  }

  

}
