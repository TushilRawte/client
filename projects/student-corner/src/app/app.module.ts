import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { TopbarComponent } from './components/layout/topbar/topbar.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FeeReceiptComponent } from './components/fee-receipt/fee-receipt.component';
import { RegistrationCardComponent } from './components/registration-card/registration-card.component';
import { AdmitCardComponent } from './components/admit-card/admit-card.component';
import { PaymentStatusComponent } from './components/payment-status/payment-status.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExaminationResultComponent } from './components/examination-result/examination-result.component';
import { CourseRegistrationComponent } from './components/course-registration/course-registration.component';
import { FormsModule } from '@angular/forms';
import { NewLayoutComponent } from './components/new-layout/new-layout.component';
import { ExamServicesComponent } from './components/exam-services/exam-services.component';
import { PaymentComponent } from './components/exam-services/payment/payment.component';
import { ReporttableComponent } from 'shared';
import { CertificateApplyComponent } from './components/certificate-apply/certificate-apply.component';
import { AddressUpdatePopupComponent } from './components/profile-update-popup/address-update-popup/address-update-popup.component';
import { MobileNumberUpdatePopupComponent } from './components/profile-update-popup/mobile-number-update-popup/mobile-number-update-popup.component';
import { NameUpdatePopupComponent } from './components/profile-update-popup/name-update-popup/name-update-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    TopbarComponent,
    DashboardComponent,
    FeeReceiptComponent,
    RegistrationCardComponent,
    AdmitCardComponent,
    PaymentStatusComponent,
    ProfileComponent,
    ExaminationResultComponent,
    CourseRegistrationComponent,
    NewLayoutComponent,
    ExamServicesComponent,
    PaymentComponent,
    CertificateApplyComponent,
    AddressUpdatePopupComponent,
    MobileNumberUpdatePopupComponent,
    NameUpdatePopupComponent

    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    NgbModule,
    BrowserAnimationsModule,
    FormsModule,
    ReporttableComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
