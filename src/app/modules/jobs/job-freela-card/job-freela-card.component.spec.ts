import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFreelaCardComponent } from './job-freela-card.component';

describe('JobFreelaCardComponent', () => {
  let component: JobFreelaCardComponent;
  let fixture: ComponentFixture<JobFreelaCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobFreelaCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFreelaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
