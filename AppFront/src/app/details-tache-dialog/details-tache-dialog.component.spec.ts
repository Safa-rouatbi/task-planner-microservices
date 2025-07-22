import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTacheDialogComponent } from './details-tache-dialog.component';

describe('DetailsTacheDialogComponent', () => {
  let component: DetailsTacheDialogComponent;
  let fixture: ComponentFixture<DetailsTacheDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTacheDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsTacheDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
