import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyLevelComponent } from './buy-level.component';

describe('BuyLevelComponent', () => {
  let component: BuyLevelComponent;
  let fixture: ComponentFixture<BuyLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
