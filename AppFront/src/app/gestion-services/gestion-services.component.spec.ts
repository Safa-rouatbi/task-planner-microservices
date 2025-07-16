import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionServicesComponent } from './gestion-services.component';

describe('GestionServicesComponent', () => {
  let component: GestionServicesComponent;
  let fixture: ComponentFixture<GestionServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
