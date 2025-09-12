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

   ngOnInit(): void {
    this.getStudentDetails();
  }
  studentData:any;
  igkvUrl:string = 'https://igkv.ac.in/'

      getStudentDetails() {
    // ^ this data will get from login session
    const academic_session_id = 24;
    const course_year_id = 2;
    const semester_id = 1;
    const college_id = 7;
    const degree_programme_id = 10;
    const ue_id = 20230270;

    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id
    }
    this.HTTP.getParam('/course/get/getStudentList/', params, 'academic').subscribe((result: any) => {
      console.warn(result.body.data[0])
      this.studentData = result.body.data[0];
    })
  }
  
}


