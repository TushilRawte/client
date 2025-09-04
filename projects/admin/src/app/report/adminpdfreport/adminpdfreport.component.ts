import { Component } from '@angular/core';
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatSelect, MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-adminpdfreport',
  templateUrl: './adminpdfreport.component.html',
  styleUrl: './adminpdfreport.component.scss',
  imports: [MatCard, MatCardContent, MatFormField, MatLabel, MatSelect, MatSelectModule]
})
export class AdminpdfreportComponent {

}
