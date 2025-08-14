import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpService } from 'shared';


@Component({
  selector: 'app-course-dashboard',
  standalone: false,
  templateUrl: './course-dashboard.component.html',
  styleUrl: './course-dashboard.component.scss'
})
export class CourseDashboardComponent  {

  acadmcSesnList:any=[]
  mainForm: any;

  ngOnInit() {  
    this.getAcademicSessionData();
    this.mainforfun();
    this.getCollegeData();
  }
  
    mainforfun(){
    this.mainForm = this.fb.group({
      session: ['', Validators.required],

     }    );
}

  constructor(private HTTP : HttpService, private fb : FormBuilder) {}

  getAcademicSessionData() {
    this.HTTP.getParam('/list/get/getModuleList/',{},'admin').subscribe((res:any) => {
      if (!res.body.error) {
        this.acadmcSesnList = res.body.data;
      }
    })
  }
  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList1/',{} ,'academic').subscribe((res:any) => {
      console.log(res);
      //this.collegeList = result.body.data;
    })
  }

}
