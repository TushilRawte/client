import {Component, OnInit} from '@angular/core';
import {environment} from 'environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'Academic';
  ngOnInit() {
    if (environment.production) {
      console.log = function () {
      };
    }
  }
}
