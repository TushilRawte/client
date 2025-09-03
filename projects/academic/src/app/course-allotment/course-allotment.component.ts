import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormArray, AbstractControl } from '@angular/forms';
import { HttpService,AlertService, PrintService } from 'shared';
import { ViewCourseallotmentComponent } from '../view-courseallotment/view-courseallotment.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-course-allotment',
  standalone: false,
  templateUrl: './course-allotment.component.html',
  styleUrl: './course-allotment.component.scss'
})
export class CourseAllotmentComponent {
[x: string]: any;

  courseAllotFormGroup!: FormGroup
  acadmcSesnList:any=[]
  collegeList:any=[]
  degreeProgramme:any=[]
  semesterList:any=[]
  courseYearList:any=[]
  isAllotTeacherBtn:boolean = false 
  isEdit: boolean = false;
  currentData:any;
  selectedCourseData:any;
  selectedCourseYearId:any
  showCourse = false;
  addedRows: any[] = [];
  tableData: any[] = [];
  courseList:any = [];
  selectedCourseNature: string = '';
  selectedCredit: string = '';
  courseTypeList:any = [];
  courseAllotType:any = [];
  teacherList:any = []; 
  new_row: any;
  editIndex: number | null = null;
  editingPrimaryKeys: any = null;
  isaddRow:boolean = false
  isShowbutton:boolean = false
  ifPrivousYearAllotment:boolean = false
  previousYearaltBtn:boolean = false
  isSbumitBtn:boolean = false
  sendToDash:any
  currentDateTime = new Date().toLocaleString();
  print_row:any;
  printDash:any;
  isMultiCollege: boolean = false; 
  isFoodTech: boolean = false;
  isSVclg: boolean = false; 
  childCollegeList: any
  selectedDegree: any;
  selectedDnCmt: any;
  allCourses:any
  isAllCourse: boolean = false; 
  showChildButton: boolean = false;
  selectedYearAndCommittee: any = null;
  selectedSubject: any;
  ifShowContainer: boolean = false
  

  toggleCourseSection(): void {
    this.isAllCourse = !this.isAllCourse;
  }
  

  constructor(private HTTP : HttpService, private fb : FormBuilder,private alert: AlertService,private dialog: MatDialog,public print :PrintService,private snackBar: MatSnackBar) {}

  ngOnInit() {  
    this.getCollegeData();
    this.getAcademicSession();
    this.getSemester(); 
    // this.getCourseList();
    this.getCourseType();
    this.getCourseAllotType();
    this.getTeacherListForCrsAlt();
    this.mainforfun();
    this.getallCourse();
  }
  
  mainforfun() {
    this.courseAllotFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      college_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      deanCommittee: [null, Validators.required],
      courseYear: [null, Validators.required],
      batch_id: [1], 
      
      // Current course selection fields
      course_id: ['', Validators.required],
      course_type_id: ['', Validators.required],
      cou_allot_type_id: ['', Validators.required],
      course_nature: [''],  
      total_credit: [''],   
      emp_id: [[]], 
      courserows: this.fb.array([])
    });

  }

  addRowToTable() {
    const teachers = this.courseAllotFormGroup.get('emp_id')?.value;
    // if (!teachers || teachers.length === 0) {
    //   alert('Please select at least one teacher');
    //   return;
    // }
  
    const selectedCourse = this.courseList.find(
      (course: { course_id: any; }) => course.course_id === this.courseAllotFormGroup.get('course_id')?.value
    );
  
    const newCourseRow = this.fb.group({
      course_id: [this.courseAllotFormGroup.get('course_id')?.value],
      course_name: [selectedCourse?.course_name],  // Store name for display
      course_nature: [selectedCourse?.course_nature],  // Store nature
      total_credit: [selectedCourse?.credit],  // Store credit
      course_type_id: [this.courseAllotFormGroup.get('course_type_id')?.value],
      cou_allot_type_id: [this.courseAllotFormGroup.get('cou_allot_type_id')?.value],
      // teacherRows: this.fb.array(
      //   teachers.map((teacherId: any) => this.fb.group({
      //     emp_id: [teacherId]
      //   }))
      // )
      teacherRows: this.fb.array(
        (teachers || []).map((teacherId: any) => this.fb.group({
          emp_id: [teacherId]
        }))
      )
    });

    
    this.courserows.push(newCourseRow);
    console.log('New course row added:', newCourseRow.value);
    // Reset form fields
    this.courseAllotFormGroup.patchValue({
      course_id: '',
      course_type_id: '',
      cou_allot_type_id: '',
      emp_id: [],
      course_nature: '',
      total_credit: ''
    });
    this.isShowbutton = false
  }

  prepareSubmitData() {
    const formValue = this.courseAllotFormGroup.value;
    return {
      academic_session_id: formValue.academic_session_id,
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      course_year_id: formValue.courseYear.course_year_id,
      semester_id: formValue.semester_id,
      // dean_committee_id: formValue.deanCommittee.dean_committee_id,
      dean_committee_id: formValue.deanCommittee.dean_committee_id,
      batch_id: formValue.batch_id,
      courserows: this.courserows.controls.map(row => ({
        course_id: row.get('course_id')?.value || null,
        course_type_id: row.get('course_type_id')?.value,
        total_credit: row.get('total_credit')?.value,
        cou_allot_type_id: row.get('cou_allot_type_id')?.value,
        teacherRows: (row.get('teacherRows') as FormArray).controls.map(teacherCtrl => ({
          emp_id: teacherCtrl.get('emp_id')?.value
        }))
      }))
    };
  }

  // onSubmit(): any {
  //   const submitData = this.prepareSubmitData();
  //   let apiUrl = '';
  //   let finalPayload: any;

  //   if (this.isMultiCollege === true) {
  //     const colg_obj = this.childCollegeList
  //     finalPayload = {
  //       acaddata: submitData,
  //       colgdata: colg_obj
  //     };
  //     // apiUrl = '/course/post/saveCourseAllotmentForMltiClg/';
  // } else if (this.isSVclg === true) {
  //   const colg_obj = this.childCollegeList
  //   finalPayload = {
  //     acaddata: submitData,
  //     colgdata: colg_obj
  //   };
  //     // apiUrl = '/course/post/saveCourseAllotmentForMltiClg/'; 
  // } else {
  //     finalPayload = submitData;
  //     // apiUrl = '/course/post/saveCourseAllotment/';
  // }
  //   console.log('Final data to submit:', finalPayload);
  //   this.HTTP.postData(apiUrl, finalPayload, 'academic').subscribe(res => {
  //     if (!res.body.error) {
  //       this.alert.alertMessage("Record Inserted...!", "", "success");
  //       this.resetForm();

  //     } else {
  //       this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
  //     }
  //   });
  // }


  onSubmit(): any {
    const submitData = this.prepareSubmitData();
    let apiUrl = '';
    let finalPayload: any;
  
    // ✅ New condition: if showChildButton & hasSpecificProgramme are both true
    if (this.showChildButton && this.hasSpecificProgramme) {
      const colg_obj = this.childCollegeList;
      finalPayload = {
        acaddata: submitData,
        colgdata: colg_obj
      };
      apiUrl = '/course/post/saveCourseAllotmentForMltiClg/';
    } else {
      finalPayload = submitData;
      apiUrl = '/course/post/saveCourseAllotment/';
    }
  
    console.log('Final data to submit:', finalPayload);
  
    this.HTTP.postData(apiUrl, finalPayload, 'academic').subscribe(res => {
      if (!res.body.error) {
        this.alert.alertMessage("Record Inserted...!", "", "success");
        this.resetForm();
      } else {
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    });
  }
  

  resetForm(): void {
    this.courseAllotFormGroup.reset()
    this.currentData = null;
    this.courseYearList = [];
  }
  resetAllotForm(): void {
    this.courseAllotFormGroup.reset()
  }

  // Getter for formArray
get courserows(): FormArray {
  return this.courseAllotFormGroup.get('courserows') as FormArray;
}

// Create new row
createCourseRow(): FormGroup {
  return this.fb.group({
    course_id: ['', Validators.required],
    course_type_id: ['', Validators.required],
    cou_allot_type_id: ['', Validators.required],
 
  });
}

// getTeacherArray(row: AbstractControl): any[] {
//   const teacherRows = row.get('teacherRows') as FormArray;
//   return teacherRows.controls.map(control => control.value);
// }
getTeacherArray(row: AbstractControl): any[] {
  // console.log("teacher array called");
  
  // Try both possible control names
  const teachersControl = row.get('teacherRows') || row.get('Teachers');
  return teachersControl ? (teachersControl as FormArray).value : [];
}

// getTeacherArray(row: AbstractControl): any[] {
//   console.log("teacher array called");

//   const teachersControl = row.get('teacherRows') || row.get('Teachers');

//   // Safely return an array even if control is missing or null
//   return teachersControl?.value?.length ? teachersControl.value : [];
// }



getCourseName(id: number): string {
  return this.courseList.find((c: { course_id: number; }) => c.course_id === id)?.course_name || '';
}

getCourseTypeName(id: number): string {
  // console.log("course called");
  
  return this.courseTypeList.find((c: { course_type_id: number; }) => c.course_type_id === id)?.course_type_name_e || '';
}

getAllotmentTypeName(id: number): string {
  return this.courseAllotType.find((c: { cou_allot_type_id: number; }) => c.cou_allot_type_id === id)?.cou_allot_type_name_e || '';
}

// getTeacherName(id: number): string {
//   return this.teacherList.find((t: { emp_id: number; }) => t.emp_id === id)?.emp_name || '';
// }

getTeacherName(emp_id: number | null): string {
  // console.log("teacher function called");
  
  if (!emp_id) return 'N/A';
  return this.teacherList.find((t: { emp_id: number; }) => t.emp_id === emp_id)?.emp_name || '';
}



removeRow(index: number) {
  this.courserows.removeAt(index);
}

  getAcademicSession() {

    this.HTTP.getParam('/master/get/getAcademicSession1/',{},'academic').subscribe((result:any) => {
      // console.log(result);
      this.acadmcSesnList = result.body.data;
    })
  }

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList1/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.collegeList = result.body.data;
    })
  }

  onCollegeChange(college_id: number) {
  // console.log('Selected College ID:', college_id);
  this.getDegreeProgramme(college_id); 
  this.getChildCollegeForCounselling(college_id); 
 }


getChildCollegeForCounselling(m_college_id: number) {
  this.HTTP.getParam('/master/get/getChildClgForCrsAllot/', { m_college_id }, 'academic')
    .subscribe((result: any) => {
      // console.log('child clg', result);
      this.childCollegeList = result.body.data;
      // console.log('child clg', this.childCollegeList);

      if (this.childCollegeList && this.childCollegeList.length > 0) {
        this.showChildButton = true;
        // this.snackBar.open('Child colleges found.', 'Close', { duration: 3000 });
      } else {
        this.showChildButton = false;
        this.snackBar.open('Master College can only Allot Course.', 'Close', { duration: 3000 });
      }
    }, error => {
      this.snackBar.open('Error fetching child colleges.', 'Close', { duration: 3000 });
    });
}


  getDegreeProgramme(college_id:number) {
    this.HTTP.getParam('/master/get/getDegreePrograamList/',{college_id},'academic').subscribe((result:any) => {
      // console.log('GP',result);
      this.degreeProgramme = result.body.data;
    })
  }

  getallCourse() {
    this.HTTP.getParam('/master/get/getCourseList/',{},'academic').subscribe((result:any) => {
      // console.log(result);
      this.allCourses = result.body.data;
    })
  }
  hasSpecificProgramme: boolean = false;
  onDegreeProgrammeChange(degree_programme_id: number) {
    const selected = this.degreeProgramme.find((p: { degree_programme_id: number; }) => p.degree_programme_id === degree_programme_id);
    const degree_id = selected?.degree_id;
    const subject_id = selected?.subject_id;
    
    // console.log('degree_id to send:', degree_id);
    this.selectedDegree = degree_id
    this.selectedSubject = subject_id;
    // ✅ Check if selected degree_programme_id is 1, 2, or 3
  this.hasSpecificProgramme = [1, 2, 3].includes(degree_programme_id);
  // console.log('hasSpecificProgramme:', this.hasSpecificProgramme);
    this.courseAllotFormGroup.get('semester_id')?.reset();
  this.courseYearList = [];
  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.semesterList = result.body.data;
    })
  }

//  / Method to call when semester dropdown changes
onSemesterChange(semester_id: number) {
  // console.log('Semester changed:', semester_id);
  this.getCourseYearList();
}

onIsAllCourseChange(isAllCourse: boolean) {}

  getCourseYearList() {
    const formValue = this.courseAllotFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.semester_id 
    ) {
      alert('Please fill all required fields ...');
      return;
    }
    const params = {
      academic_session_id: formValue.academic_session_id,
      semester_id: formValue.semester_id,
      college_id: formValue.college_id,
      degree_id: this.selectedDegree
    };
    console.log('Params for course year list:', params);
    this.HTTP.getParam('/master/get/getYearDeancmtList/',params ,'academic').subscribe((result:any) => {
      // console.log('course Year',result);
      this.courseYearList = result.body.data;
      console.log('Course Year List:', this.courseYearList);
      
      if (this.courseYearList && this.courseYearList.length > 0) {
        // Loop through each year row and call status API
        this.courseYearList.forEach((row: any, index: number) => {
          const checkParams = {
            academic_session_id: params.academic_session_id,
            semester_id: params.semester_id,
            college_id: params.college_id,
            degree_programme_id: formValue.degree_programme_id,
            course_year_id: row.course_year_id,
            dean_committee_id: row.dean_committee_id
          };
  
          this.HTTP.getParam('/master/get/checkCourseAllotment', checkParams, 'academic')
          .subscribe((response: any) => {
            const exists = response?.body?.data?.[0]?.data_exists === 1;
            row.allotmentStatus = exists; // ✅ Update directly on the row
          });
        });
      }


    })
  }

  getCourseList() {
    const formValue = this.courseAllotFormGroup.value;
    if (
      !formValue.semester_id 
    ) {
      alert('Please fill all required fields ...');
      return;
    }
    const params = {
      semester_id: formValue.semester_id,
      dean_committee_id: this.selectedDnCmt,
      degree_id: this.selectedDegree,
      subject_id: this.selectedSubject
    };
    this.HTTP.getParam('/master/get/getCourseForAllot/',params ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.courseList = result.body.data;
    })
  }
  
  getCourseAllList() {
    this.HTTP.getParam('/master/get/getCourseForAllot/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      // this.courseList = result.body.data;
    })
  }

  onCourseChange(selectedCourseId: number): void {
    const selectedCourse = this.courseList.find((course: { course_id: number; }) => course.course_id === selectedCourseId);
    if (selectedCourse) {
      this.courseAllotFormGroup.patchValue({
        course_nature: selectedCourse.course_nature,
        total_credit: selectedCourse.credit
      });
    } else {
      this.courseAllotFormGroup.patchValue({
        course_nature: '',
        total_credit: ''
      });
    }
  }

  getCourseType() {
    this.HTTP.getParam('/master/get/getCourseTypeList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.courseTypeList = result.body.data;
    })
  }

  getCourseAllotType() {
    this.HTTP.getParam('/master/get/getCourseAllotmentTypeList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.courseAllotType = result.body.data;
    })
  }

  getTeacherListForCrsAlt() {
    this.HTTP.getParam('/master/get/getTeacherForCrsAlt/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.teacherList = result.body.data;
    })
  }


  getCourseforUpdate() {
    const formValue = this.courseAllotFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.degree_programme_id ||
      !formValue.courseYear?.course_year_id ||
      !formValue.semester_id ||
      !formValue.deanCommittee?.dean_committee_id
    ) {
      alert('Please fill all required fields');
      return;
    }
    const params = {
      academic_session_id: formValue.academic_session_id,
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      course_year_id: formValue.courseYear?.course_year_id,  
      semester_id: formValue.semester_id,
      dean_committee_id: formValue.deanCommittee?.dean_committee_id, 
    };
    // console.log('this is course year',params.course_year_id);
    
    this.HTTP.getParam('/master/get/getCourseForUpdate/', params, 'academic').subscribe(
      (result: any) => {
        // console.log('Full API Response:', result); // First, log the complete response
        
        if (result.body?.data?.courserows) {
          // console.log('Data found:', result.body?.data?.courserows);
         this.new_row = result.body?.data?.courserows
          this.populateCourseTable(result.body?.data?.courserows);
        } else {
          console.warn('No courserows found in response', result);
        }
      }, 
      (error) => {
        console.error('API Error:', error);
      }
    );
  }


  // send data and open dilog
  openDilog(item:any) {
    const formValue = this.courseAllotFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.degree_programme_id ||
      !formValue.semester_id 
      // if need to check courseYear and deanCommittee, uncomment the next two lines
      // !formValue.courseYear?.course_year_id ||
      // !formValue.deanCommittee?.dean_committee_id
    ) {
      alert('Please fill all required fields before fetching allotment.');
      return;
    }
    const sessionObj = this.acadmcSesnList.find((s: { academic_session_id: any; }) => s.academic_session_id === formValue.academic_session_id);
    const collegeObj = this.collegeList.find((c: { college_id: any; }) => c.college_id === formValue.college_id);
    const programmeObj = this.degreeProgramme.find((p: { degree_programme_id: any; }) => p.degree_programme_id === formValue.degree_programme_id);
    const semesterObj = this.semesterList.find((s: { semester_id: any; }) => s.semester_id === formValue.semester_id);
   
    this.sendToDash = this.selectedCourseData = {
      session: sessionObj?.academic_session_name_e || '',
      college: collegeObj?.college_name_e || '',
      programme: programmeObj?.degree_programme_name_e || '',
      semester: semesterObj?.semester_name_e || '',
      semester_id: semesterObj?.semester_id || null,
      deanCommittee: item.dean_committee_name_e,
      deanCommittee_id: item.dean_committee_id,
      batch: 'Batch I & II',
      course_year_id: item.course_year_id,
      course_year_name_e: item.course_year_name_e,
    };
    const params = {
      academic_session_id: formValue.academic_session_id,
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      course_year_id: item?.course_year_id,  
      semester_id: formValue.semester_id,
      dean_committee_id: item?.dean_committee_id, 
    };
    this.HTTP.getParam('/master/get/getCourseForUpdate/', params, 'academic').subscribe(
      (result: any) => {
        // console.log('Full API Response:', result); // First, log the complete response 
        
        if (result.body?.data?.courserows) {
          // console.log('Data found:', result.body?.data?.courserows);
         this.new_row = result.body?.data?.courserows
          // this.populateCourseTable(result.body?.data?.courserows);
          // ✅ Open Dialog and send data
        this.dialog.open(ViewCourseallotmentComponent, {
          width: '1100px',
          height:'600px',

          data: {
            courseData: this.new_row,
            params: params,
            currentData:this.sendToDash
          }
        });
          
        } else {
          console.warn('No courserows found in response', result);
        }
      }, 
      (error) => {
        console.error('API Error:', error);
      }
    );
  }


  // Populate table with API data
  populateCourseTable(courseData: any[]) {
    // Clear existing rows safely
    while (this.courserows.length > 0) {
      this.courserows.removeAt(0);
    }
    // Add new rows
    courseData.forEach(course => {
      // const teacherArray = this.fb.array(
      //   course.teacherRows.map((teacher: { emp_id: any; course_allotment_teacher_main_id: any; }) => this.fb.group({
      //     emp_id: teacher?.emp_id,
      //     course_allotment_teacher_main_id: teacher.course_allotment_teacher_main_id
      //   }))
      // );
      const teacherArray = this.fb.array(
        (course.teacherRows || []).map((teacher: { emp_id: any; course_allotment_teacher_main_id: any; }) => this.fb.group({
          emp_id: teacher?.emp_id,
          course_allotment_teacher_main_id: teacher?.course_allotment_teacher_main_id
        }))
      );
      
      this.courserows.push(this.fb.group({
        allotment_detail_id: course.allotment_detail_id,
        allotment_main_id: course.allotment_main_id,
        course_id: course.course_id,
        course_name: course.course_name,
        course_type_id: course.course_type_id,
        cou_allot_type_id: course.cou_allot_type_id,
        course_nature: course.course_nature,
        total_credit: course.credit || 0,
        teacherRows: teacherArray  // Matches your insert structure
      }));
    });
  }

  openCourseGenforUpdate(item:any){
    this.openCourseGeneral(item)
    this.getCourseforUpdate()
    this.resetCourseAllotmentFields()
    this.isaddRow = false
    this.isShowbutton = true
    this.previousYearaltBtn = false
    this.isSbumitBtn = false
    this.isEdit = true;
    this.ifShowContainer = true
  }

  openCourseGeneralCall(item: any): void {
    this.isaddRow =  true; 
    this.isEdit = false;
    this.previousYearaltBtn = false
    this.isSbumitBtn = true
    this.openCourseGeneral(item)
    this.resetCourseAllotmentFields()
    this.clearcourserows()
    this.checkIfRypurClgAndDnCmt5(item)
    this.checkIfSvClgAndDnCmt5(item)
  }

  openCourseGeneralforDilog(item:any){
     this.openDilog(item)
  }

  getPreviousYearAllotment(item: any) {
     this.ifShowContainer = true
    this.openCourseGeneral(item)


    const formValue = this.courseAllotFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.degree_programme_id ||
      !formValue.courseYear?.course_year_id ||
      !formValue.semester_id ||
      !formValue.deanCommittee?.dean_committee_id
    ) {
      alert('Please fill all required fields before fetching previous year allotment.');
      return;
    }
    const params = {
      academic_session_id: formValue.academic_session_id - 1, // Assuming previous year is current year - 1
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      course_year_id: formValue.courseYear?.course_year_id,  
      semester_id: formValue.semester_id,
      dean_committee_id: formValue.deanCommittee?.dean_committee_id, 
    };
    this.HTTP.getParam('/master/get/getCourseForUpdate/', params, 'academic').subscribe(
      (result: any) => {
        // console.log('Full API Response:', result); 
        
        if (result.body?.data?.courserows && result.body.data.courserows.length > 0) {
          console.log('Data found:', result.body?.data?.courserows);
         this.new_row = result.body?.data?.courserows
          this.populateCourseTable(result.body?.data?.courserows);
          
        } else {
          alert('No previous year allotment data found.');
        }
      }, 
      (error) => {  
        console.error('API Error:', error);
      }
    );
    this.previousYearaltBtn = true
    this.isaddRow = false
    this.isShowbutton = true
    this.isSbumitBtn = false
    this.isEdit = true;
    this.ifShowContainer = true
  }

  getDataForPrint(item: any) {
    this.openCourseGeneral(item)
    const formValue = this.courseAllotFormGroup.value;
    const sessionObj = this.acadmcSesnList.find((s: { academic_session_id: any; }) => s.academic_session_id === formValue.academic_session_id);
    const collegeObj = this.collegeList.find((c: { college_id: any; }) => c.college_id === formValue.college_id);
    const programmeObj = this.degreeProgramme.find((p: { degree_programme_id: any; }) => p.degree_programme_id === formValue.degree_programme_id);
    const semesterObj = this.semesterList.find((s: { semester_id: any; }) => s.semester_id === formValue.semester_id);
   
    this.printDash = this.selectedCourseData = {
      session: sessionObj?.academic_session_name_e || '',
      college: collegeObj?.college_name_e || '',
      programme: programmeObj?.degree_programme_name_e || '',
      semester: semesterObj?.semester_name_e || '',
      semester_id: semesterObj?.semester_id || null,
      deanCommittee: item.dean_committee_name_e,
      deanCommittee_id: item.dean_committee_id,
      batch: 'Batch I & II',
      course_year_id: item.course_year_id,
      course_year_name_e: item.course_year_name_e,
    };
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.degree_programme_id ||
      !formValue.courseYear?.course_year_id ||
      !formValue.semester_id ||
      !formValue.deanCommittee?.dean_committee_id
    ) {
      alert('Please fill all required fields before Print.');
      return;
    }
    const params = {
      academic_session_id: formValue.academic_session_id, 
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      course_year_id: formValue.courseYear?.course_year_id,  
      semester_id: formValue.semester_id,
      dean_committee_id: formValue.deanCommittee?.dean_committee_id, 
    };
    this.HTTP.getParam('/master/get/getCourseForUpdate/', params, 'academic').subscribe(
      (result: any) => {
        console.log('Full API Response:', result); 
        
        if (result.body?.data?.courserows && result.body.data.courserows.length > 0) {
          console.log('Data found:', result.body?.data?.courserows);
         this.print_row = result.body?.data?.courserows
          // this.populateCourseTable(result.body?.data?.courserows);
          
        } else {
          alert('No previous year allotment data found.');
        }
      }, 
      (error) => {
        console.error('API Error:', error);
      }
    );
    this.isaddRow = false
    this.isShowbutton = false
    this.previousYearaltBtn = false
    this.isSbumitBtn = false
    this.printData();
  }

  printData() {
    const content = document.getElementById('print-section')?.innerHTML;
    if (content) {
      this.print.printHTML(content);
    } else {
      console.error('Printable section not found');
    }
  }

  checkIfRypurClgAndDnCmt5(item:any){
    const formValue = this.courseAllotFormGroup.value.college_id;
    console.log('selected clg id', formValue);
    const dean_committe = item.dean_committee_id
    console.log('selected dean committee id', dean_committe);
    if (formValue === 5 && dean_committe === 5) {
      this.isMultiCollege = true;
    } else {
      this.isMultiCollege = false;
    }
  }
  checkIfSvClgAndDnCmt5(item:any){
    const formValue = this.courseAllotFormGroup.value.college_id;
    console.log('selected clg id', formValue);
    const dean_committe = item.dean_committee_id
    console.log('selected dean committee id', dean_committe);
    if (formValue === 53 && dean_committe === 5) {
      this.isSVclg = true;
    } else {
      this.isSVclg = false;
    }
  }

   // Open openCourseGeneral function  get data and when click add  icon in course allotment main form 
   openCourseGeneral(item: any): void {
    //here patch value from main form to selectedCourseData objct for send to dashboard components
    console.log('Selected item:', item);
    const formValue = this.courseAllotFormGroup.value;
   this.courseAllotFormGroup.patchValue({          
      deanCommittee: {
        dean_committee_id: item.dean_committee_id,
      },
      courseYear:{
        course_year_id: item.course_year_id
      }
    });
    
 const sessionObj = this.acadmcSesnList.find((s: { academic_session_id: any; }) => s.academic_session_id === formValue.academic_session_id);
 const collegeObj = this.collegeList.find((c: { college_id: any; }) => c.college_id === formValue.college_id);
 const programmeObj = this.degreeProgramme.find((p: { degree_programme_id: any; }) => p.degree_programme_id === formValue.degree_programme_id);
 const semesterObj = this.semesterList.find((s: { semester_id: any; }) => s.semester_id === formValue.semester_id);

 this.currentData = this.selectedCourseData = {
   session: sessionObj?.academic_session_name_e || '',
   college: collegeObj?.college_name_e || '',
   programme: programmeObj?.degree_programme_name_e || '',
   semester: semesterObj?.semester_name_e || '',
   semester_id: semesterObj?.semester_id || null,
   deanCommittee: item.dean_committee_name_e,
   deanCommittee_id: item.dean_committee_id,
   batch: 'Batch I & II',
   course_year_id: item.course_year_id,
   course_year_name_e: item.course_year_name_e,
 };
    this.selectedCourseYearId = item.course_year_id;
    this.showCourse = true;
    this.selectedDnCmt = item.dean_committee_id;
    this.getCourseList()
  }

  editRow(row:any, index: number) {
    console.log("i am called");
    
    this.editIndex = index;
  
    
  
    this.courseAllotFormGroup.patchValue({
      course_id: row.get('course_id')?.value,
      course_type_id: row.get('course_type_id')?.value,
      cou_allot_type_id: row.get('cou_allot_type_id')?.value,
      course_nature: row.get('course_nature')?.value,
      total_credit: row.get('total_credit')?.value,
      // emp_id: row.get('teacherRows')?.value.map((t: any) => t.emp_id)
      emp_id: (row.get('teacherRows')?.value || [])
  .map((t: any) => t.emp_id)
  .filter((id: number | null) => id !== null && id !== undefined)

    });
    console.log('value',this.courseAllotFormGroup.value);
    // Store primary keys for backend update
    this.editingPrimaryKeys = {
      allotment_detail_id: row.get('allotment_detail_id')?.value,
      allotment_main_id: row.get('allotment_main_id')?.value,
      teacherRows: row.get('teacherRows')?.value
    };
    this.isEdit = true;
    this.isaddRow = false; 
  }

  // submitUpdatedRow() {
  //   const formValue = this.courseAllotFormGroup.value;
  //   const payload = {
  //     allotment_detail_id: this.editingPrimaryKeys.allotment_detail_id,
  //     allotment_main_id: this.editingPrimaryKeys.allotment_main_id,
  //     course_id: formValue.course_id,
  //     course_type_id: formValue.course_type_id,
  //     cou_allot_type_id: formValue.cou_allot_type_id,
  //     course_nature: formValue.course_nature,
  //     total_credit: formValue.total_credit,
  //     teacherRows: (formValue.emp_id || []).map((empId: any) => {
  //       const oldTeacher = this.editingPrimaryKeys.teacherRows.find((t: any) => t.emp_id === empId);
  //       return {
  //         emp_id: empId,
  //         course_allotment_teacher_main_id: oldTeacher?.course_allotment_teacher_main_id || null
  //       };
  //     })
  //   };
  
  //   console.log('Sending payload to update API:', payload);
  
  //   this.HTTP.putData('/course/update/updateCourseAllotment/', payload, 'academic').subscribe(
  //     (res: any) => {
  //       if (!res.body.error) {
  //         this.alert.alertMessage("Record Updated...!", "", "success");
  //         // this.resetAllotForm();
  //         this.getCourseforUpdate()
  //         this.clearcourserows();
  //       } else {
  //         this.alert.alertMessage("Something went wring!", res.body.error?.message, "warning")
  //       }
  //     },
  //   );
  // }

  submitUpdatedRow() {
    if (!this.editingPrimaryKeys?.allotment_detail_id || !this.editingPrimaryKeys?.allotment_main_id) {
      console.error('Missing primary key data for update.');
      this.alert.alertMessage("Update failed", "Missing course identification data.", "warning");
      return;
    }
  
    const formValue = this.courseAllotFormGroup.value;
  
    const payload = {
      allotment_detail_id: this.editingPrimaryKeys.allotment_detail_id,
      allotment_main_id: this.editingPrimaryKeys.allotment_main_id,
      course_id: formValue.course_id,
      course_type_id: formValue.course_type_id,
      cou_allot_type_id: formValue.cou_allot_type_id,
      course_nature: formValue.course_nature,
      total_credit: formValue.total_credit,
      teacherRows: (formValue.emp_id || []).map((empId: any) => {
        const oldTeacher = this.editingPrimaryKeys.teacherRows.find((t: any) => t.emp_id === empId);
        return {
          emp_id: empId,
          course_allotment_teacher_main_id: oldTeacher?.course_allotment_teacher_main_id || null
        };
      })
    };
  
    console.log('Sending payload to update API:', payload);
  
    this.HTTP.putData('/course/update/updateCourseAllotment/', payload, 'academic').subscribe(
      (res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Record Updated...!", "", "success");
          this.getCourseforUpdate();
          this.clearcourserows();
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      }
    );
  }
  
  
  // Reset the form 
  resetCourseAllotmentFields(): void {
    this.courseAllotFormGroup.patchValue({
      course_id: '',
      course_type_id: '',
      cou_allot_type_id: '',
      course_nature: '',
      total_credit: '',
    });
    this.courseAllotFormGroup.get('course_id')?.reset();
    this.courseAllotFormGroup.get('course_type_id')?.reset();
    this.courseAllotFormGroup.get('cou_allot_type_id')?.reset();
    this.courseAllotFormGroup.get('course_nature')?.reset();
    this.courseAllotFormGroup.get('total_credit')?.reset();
    this.courseAllotFormGroup.get('emp_id')?.reset();
  }

  clearcourserows() {
    this.courserows.clear(); 
  }
  
  // deleteParticularCourse(row: any, index: number): void {
  //   const allotment_detail_id = row.get('allotment_detail_id')?.value;
  //   console.log('Deleting row with allotment_detail_id:', allotment_detail_id);
  //   if (allotment_detail_id) {
  //     const queryParams = `?allotment_detail_id=${allotment_detail_id}`;
  //     // Call your delete API
  //     this.HTTP.deleteData(`/course/delete/deletePartucularCourse/${queryParams}`, { }, 'academic').subscribe({
  //       next: (res) => {
  //         console.log('Deleted successfully:', res);
  //         this.courserows.removeAt(index); // Remove row from form array UI
  //       },
  //       error: (err) => {
  //         console.error('Error deleting:', err);
  //       }
  //     });
  //     this.courserows.removeAt(index);
  //   } else {
  //     // If no ID, it's just a UI-only row, remove from form array
  //     this.courserows.removeAt(index);
  //   }
  // }
  
  
  deleteParticularCourse(row: any, index: number): void {
    const allotment_detail_id = row.get('allotment_detail_id')?.value;
    console.log('Deleting row with allotment_detail_id:', allotment_detail_id);
  
    if (allotment_detail_id) {
      const queryParams = `?allotment_detail_id=${allotment_detail_id}`;
  
      this.HTTP.deleteData(`/course/delete/deletePartucularCourse/${queryParams}`, {}, 'academic').subscribe({
        next: (res) => {
          console.log('Deleted successfully:', res);
          alert('✅ Course deleted successfully!');
          this.courserows.removeAt(index);
        },
        error: (err) => {
          console.error('Error deleting:', err);
          alert('❌ Failed to delete course. Please try again.');
        }
      });
    } else {
      // If no ID, it's just a UI-only row, remove from form array
      this.courserows.removeAt(index);
    }
  }
  


}
