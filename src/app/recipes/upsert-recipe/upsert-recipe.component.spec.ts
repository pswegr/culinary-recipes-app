import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertRecipeComponent } from './upsert-recipe.component';

describe('UpsertRecipeComponent', () => {
  let component: UpsertRecipeComponent;
  let fixture: ComponentFixture<UpsertRecipeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpsertRecipeComponent]
    });
    fixture = TestBed.createComponent(UpsertRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
