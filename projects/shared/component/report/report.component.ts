import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { take } from 'rxjs';
import { HttpService, PrintService } from 'shared';
import * as XLSX from 'xlsx';
import { MatCard, MatCardContent, MatCardHeader, MatCardActions } from "@angular/material/card";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-report',
  imports: [MatCard, MatCardContent, MatCardHeader, BrowserAnimationsModule, MatCardActions, MatIcon],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent {
  @ViewChild('print_content') print_content!: ElementRef;
  @ViewChild('table') table!: ElementRef;

  @Input() options: any; // PDF or Print options

  @Input() data: any; // Input passed from parent
  @Input() tableColumns: any[] = []; // Dynamic columns
  @Input() infoFields: any[] = []; // Dynamic info fields

  constructor(
    public print: PrintService,
    private http: HttpService
  ) { }

  resolveImage(path: string): string {
    return path?.startsWith('http') ? path : `https://igkv.ac.in/${path}`;
  }

  getValueByPath(path: string, obj: any): any {
    if (!path || !obj || typeof path !== 'string') return '';
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), obj);
  }


  // printData(): void {
  //   const htmlContent = this.print_content.nativeElement.innerHTML;
  //   this.print.printHTML(htmlContent).catch(err => console.error('Print error:', err));
  // }

  printData(): void {
    const printContents = this.print_content.nativeElement.innerHTML;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;

    if (!doc) {
      console.error("Failed to create iframe document for printing");
      return;
    }
    const currentDateTime = new Date().toLocaleString();
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>IGKV | Report</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            @page {
             margin: 5mm 6mm 10mm 6mm; /* top, right, bottom, left */
             counter-increment: page;
            }

            body {
              margin: 0;
              padding: 0;
            }

            .print-wrapper {
              padding: 20px;
            }

          /* Custom footer */
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10mm;
            font-size: 12px;
            color: #444;
          }

          .footer .datetime::before {
            content: "${currentDateTime}";
            margig-top: -2rem;
          }

          .footer .pagenum::before {
            content: counter(page);
          }
            .table {
              width: 100%;
              border-collapse: collapse;
            }

            .table-bordered th,
            .table-bordered td {
              border: 1px solid #dee2e6 !important;
              padding: 0.75rem;
            }

            .text-center {
              text-align: center !important;
            }

            .fw-bold {
              font-weight: bold !important;
            }

            .mt-3 {
              margin-top: 1rem !important;
            }

            .mt-4 {
              margin-top: 1.5rem !important;
            }

            .mb-2 {
              margin-bottom: 0.5rem !important;
            }

            .mb-4 {
              margin-bottom: 1.5rem !important;
            }

            .m-1 {
              margin: 0.25rem !important;
            }

            .row {
              display: flex;
              flex-wrap: wrap;
            }

            .d-print-none {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContents}
          </div>
        <div class="footer">
         <!-- <div class="datetime"></div> -->
         <!-- <div class="pagenum"></div> -->
        </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Optional: Clean up
        document.body.removeChild(iframe);
      }, 300);
    };
  }

  getPdf(): void {
    const html = this.print_content.nativeElement.innerHTML;
    this.http.postBlob(`/file/htmltoPdf/`, {
      html,
      orientation: this.options?.orientation || 'portrait'
    }, null).pipe(take(1)).subscribe(() => console.log("PDF Generated"));
  }

  getExcel(): void {
    const tableEl = this.table.nativeElement;
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableEl);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Attendance.xlsx`);
  }
}
