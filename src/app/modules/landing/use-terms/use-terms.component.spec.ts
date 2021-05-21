import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UseTermsComponent } from './use-terms.component';

describe('UseTermsComponent', () => {
  let component: UseTermsComponent;
  let fixture: ComponentFixture<UseTermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UseTermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UseTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
