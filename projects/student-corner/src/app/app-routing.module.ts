import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FeeReceiptComponent } from './components/fee-receipt/fee-receipt.component';
import { RegistrationCardComponent } from './components/registration-card/registration-card.component';
import { AdmitCardComponent } from './components/admit-card/admit-card.component';
import { PaymentStatusComponent } from './components/payment-status/payment-status.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ExaminationResultComponent } from './components/examination-result/examination-result.component';
import { CourseRegistrationComponent } from './components/course-registration/course-registration.component';
import { NewLayoutComponent } from './components/new-layout/new-layout.component';

const routes: Routes = [
{
        path: '',
        component: NewLayoutComponent,
        children:[
            {path: '', redirectTo: 'dashboard',  pathMatch: 'full'},
            {path: 'dashboard', component:DashboardComponent} ,
            {path: 'fee-receipt', component: FeeReceiptComponent},
            {path: 'registration-card', component: RegistrationCardComponent},
            {path: 'admit-card', component: AdmitCardComponent},
            {path: 'payment-status', component: PaymentStatusComponent},
            {path: 'profile', component: ProfileComponent},
            {path: 'result', component: ExaminationResultComponent},
            {path: 'course-registration', component: CourseRegistrationComponent},
        ],
      },
      {
        path:'old',
        component:LayoutComponent
      }

      
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
