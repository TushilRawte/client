import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmitCardComponent } from './admit-card.component';

describe('AdmitCardComponent', () => {
  let component: AdmitCardComponent;
  let fixture: ComponentFixture<AdmitCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdmitCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
