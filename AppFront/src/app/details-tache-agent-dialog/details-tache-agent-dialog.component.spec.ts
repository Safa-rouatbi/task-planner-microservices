import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTacheAgentDialogComponent } from './details-tache-agent-dialog.component';

describe('DetailsTacheAgentDialogComponent', () => {
  let component: DetailsTacheAgentDialogComponent;
  let fixture: ComponentFixture<DetailsTacheAgentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTacheAgentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsTacheAgentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
