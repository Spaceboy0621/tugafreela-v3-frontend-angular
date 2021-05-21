import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobClientCardComponent } from './job-client-card.component';

describe('JobClientCardComponent', () => {
  let component: JobClientCardComponent;
  let fixture: ComponentFixture<JobClientCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobClientCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobClientCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
