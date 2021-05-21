import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFreelaComponent } from './search-freela.component';

describe('SearchFreelaComponent', () => {
  let component: SearchFreelaComponent;
  let fixture: ComponentFixture<SearchFreelaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFreelaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFreelaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
