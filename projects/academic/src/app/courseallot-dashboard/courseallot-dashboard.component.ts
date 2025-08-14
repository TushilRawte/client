import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-courseallot-dashboard',
  standalone: false,
  templateUrl: './courseallot-dashboard.component.html',
  styleUrl: './courseallot-dashboard.component.scss'
})
export class CourseallotDashboardComponent {
  @Input() data: any;

}
