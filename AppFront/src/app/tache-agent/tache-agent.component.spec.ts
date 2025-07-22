import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacheAgentComponent } from './tache-agent.component';

describe('TacheAgentComponent', () => {
  let component: TacheAgentComponent;
  let fixture: ComponentFixture<TacheAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TacheAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TacheAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
