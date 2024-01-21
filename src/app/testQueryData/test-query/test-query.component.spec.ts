import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestQueryComponent } from './test-query.component';

describe('TestQueryComponent', () => {
  let component: TestQueryComponent;
  let fixture: ComponentFixture<TestQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestQueryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
