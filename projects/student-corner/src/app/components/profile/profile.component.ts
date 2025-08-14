import { Component } from '@angular/core';
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
  
}


