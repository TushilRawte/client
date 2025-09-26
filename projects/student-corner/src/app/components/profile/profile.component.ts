import { Component } from '@angular/core';
import { HttpService } from 'shared';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  // profileFormGroup:any 

  //   constructor(private fb: FormBuilder){};

  // finalizeCourseForm() {
  //   this.profileFormGroup = this.fb.group({
  //     academic_session_id: ['', Validators.required],
  //     college_id: ['', Validators.required],
  //     degree_programme_id: ['', Validators.required],
  //     semester_id: ['', Validators.required],
  //   });
  // }

  constructor(private HTTP: HttpService) { }
  sessionData: any = {};
  ngOnInit(): void {
    const storedData = sessionStorage.getItem('studentData');
    if (storedData) {
      const studentData = JSON.parse(storedData);
      this.sessionData = studentData
      this.getStudentDetails();
    }
  }
  studentData: any;
  igkvUrl: string = 'https://igkv.ac.in/'

  getStudentDetails() {
    const params = {
      academic_session_id: this.sessionData?.academic_session_id,
      course_year_id: this.sessionData?.course_year_id,
      semester_id: this.sessionData?.semester_id,
      college_id: this.sessionData?.college_id,
      degree_programme_id: this.sessionData?.degree_programme_id,
      ue_id: this.sessionData?.ue_id
    }
    this.HTTP.getParam('/course/get/getStudentList/', params, 'academic').subscribe((result: any) => {
      console.warn(result.body.data[0])
      this.studentData = result.body.data[0];
    })
  }

}


