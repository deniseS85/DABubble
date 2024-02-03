import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadsHeaderComponent } from './threads-header.component';

describe('ThreadsHeaderComponent', () => {
  let component: ThreadsHeaderComponent;
  let fixture: ComponentFixture<ThreadsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThreadsHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
