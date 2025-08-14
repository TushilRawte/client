import { Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';



@Component({
  selector: 'app-view-courseallotment',
  standalone: false,
  templateUrl: './view-courseallotment.component.html',
  styleUrl: './view-courseallotment.component.scss'
})
export class ViewCourseallotmentComponent {
  courseData: any[] = [];
  currentData:any

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,private dialogRef: MatDialogRef<ViewCourseallotmentComponent>) {}
  ngOnInit() {
     this.courseData = this.data.courseData
     this.currentData = this.data.currentData
    console.log('Received course data:', this.data.courseData);
    console.log('Received params:', this.data.params);
  }

closeDialog(): void {
  this.dialogRef.close();
}

}
  