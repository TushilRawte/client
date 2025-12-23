import {Component, OnInit} from '@angular/core';
import {AuthService} from 'shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'student-corner';
 constructor(private auth: AuthService) {
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {

    }
  }
}

