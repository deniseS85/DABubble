import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadQuestionComponent } from './thread-question.component';

describe('ThreadQuestionComponent', () => {
  let component: ThreadQuestionComponent;
  let fixture: ComponentFixture<ThreadQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThreadQuestionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
