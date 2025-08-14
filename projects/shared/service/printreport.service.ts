import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintreportService {

  printDiv(divId: string) {
    const divToPrint = document.getElementById(divId);
    if (!divToPrint) {
      console.error(`No element found with id: ${divId}`);
      return;
    }

    const printContents = divToPrint.innerHTML;

    // Collect all stylesheets
    let styles = '';
    Array.from(document.styleSheets).forEach((styleSheet: any) => {
      try {
        if (styleSheet.cssRules) {
          Array.from(styleSheet.cssRules).forEach((rule: any) => {
            styles += rule.cssText;
          });
        }
      } catch (err) {
        console.warn('Could not access stylesheet', err);
      }
    });

    const popupWin = window.open('', '_blank', 'width=900,height=700');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              ${styles}
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContents}
          </body>
        </html>
      `);
      popupWin.document.close();
    }
  }
}
