import { Injectable } from '@angular/core';
import { AlertService, HttpService, LoaderService } from 'shared';
import { moduleMapping } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class EsignService {
  private serviceStatus: boolean | null = null;
  private certSubject: string | null = null;
  private firstEsignDone: boolean = false;
  esignData: any = {};
  tickImage = `${moduleMapping.imageUrl}/tick.png`;
  user: any = { designation_arr: [327] };

  constructor(
    private http: HttpService,
    private alert: AlertService,
  ) { }

  // 👇 STEP 1: Setup EDS only once
  async setupEDS(moduleid: number): Promise<void> {
    try {
      // ✅ Check service (only once)
      let checkData: any;
      if (this.serviceStatus === null) {
        try {
          const check = await fetch('http://localhost:8800/checkservice');
          if (!check.ok) {
            throw new Error('Failed to connect to EDS Service.');
          }
          checkData = await check.json();
          this.serviceStatus = true;
        } catch (err) {
          // If fetch fails (e.g., connection refused)
          throw new Error('EDS Service not running. Please start your EDS tool.');
        }
        if (!checkData.isServiceRunning) {
          throw new Error('EDS Service not running. Please start your EDS tool.');
        }
      }

      // ✅ Register certificate (only once)
      if (this.certSubject === null) {
        const cert = await fetch('http://localhost:8800/registercertificate');
        // this.loaderService.hide();
        const certData = await cert.json();
        if (!certData.subject) throw new Error('No certificate selected.');
        this.certSubject = certData.subject;
        // console.log("Certificate Registered ✅:", this.certSubject);
      } else {
        // this.loaderService.hide();
      }

      // ✅ Get DSC eSign config (only once)
      if (!this.esignData?.filetype) {
        await new Promise<void>((resolve, reject) => {
          this.http.getParam('/esign/get/dsc_esign', {
            post_code: this.user.designation_arr[0],
            moduleid
          }, 'academic').subscribe(
            (result: any) => {
              if (result?.body?.data?.length > 0) {
                this.esignData = result?.body?.data?.[0];
                this.firstEsignDone = true;
                // console.log("eSign Config Fetched ✅");
                resolve();
              } else {
                this.alert.alertMessage("E-sign failed", "Un-authorized user for esign that document", "error");
                reject({ message: "Un-authorized user for esign that document" })
              }
            },
            (error) => {
              console.error('Error fetching DSC eSign:', error);
              this.alert.alertMessage("Error", "Unable to fetch eSign config", "error");
              reject(error);
            }
          );
        });
      }
    } catch (error: any) {
      console.error('EDS Setup Error:', error);
      this.alert.alertMessage("EDS Setup Failed", error.message, "error");
      throw error;
    }
  }

  // 👇 STEP 2: Use setup data for signing multiple files
  async callEsignService(fileBase64: string) {
    // let temp = await this.convertFileToBase64(this.tickImage);
    try {
      const payload = {
        documentType: this.esignData?.filetype || "PDF",
        registeredCertificateSubject: this.certSubject,
        disableCertificateSelection: this.firstEsignDone,
        // disableCertificateSelection: false,
        documentId: this.generateRandomId().toString(),
        documentTextData: null,
        documentBinaryData: await this.convertFileToBase64(fileBase64),
        signaturePurpose: this.esignData?.description || "Document Signing",
        locationOfSigning: "IGKV, Raipur (C.G.)",
        dataHash: null,
        addScannedSign: true,
        scannedSignData: await this.convertFileToBase64(this.tickImage),
        signTopPosition: this.esignData?.signtopposition || 100,
        signRightPosition: this.esignData?.signrightposition || 550,
        signBottomPosition: this.esignData?.signbottomposition || 50,
        signLeftPosition: this.esignData?.signleftposition || 400,
        padStandardCompliant: true,
        signatureDisplayOn: 2,
        isFinalSignature: true,
        pageorientation: this.esignData?.pageorientation === "Landscape" ? 0 : 1,
      };

      const signResponse = await fetch('http://localhost:8800/postcertificatedata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const { isDocumentSigned, signedDocumentData, message, reason } = await signResponse.json();
      if (!isDocumentSigned) throw new Error(message + reason || 'Failed to sign document.');

      return signedDocumentData;
    } catch (error: any) {
      console.error('E-sign Error:', error);
      this.alert.alertMessage('E-sign failed', error.message, 'error');
    }
  }

  private generateRandomId = () => Date.now() + '_' + Math.floor(Math.random() * 1000000);

  async convertFileToBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error converting file to Base64:', err);
      return null;
    }
  }

 resetEsignState() {
  this.certSubject = null;
  this.firstEsignDone = false;
  this.esignData = {};
  this.serviceStatus = null; // optional reset of service state
}


}