import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateApplyComponent } from './certificate-apply.component';

describe('CertificateApplyComponent', () => {
  let component: CertificateApplyComponent;
  let fixture: ComponentFixture<CertificateApplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CertificateApplyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
