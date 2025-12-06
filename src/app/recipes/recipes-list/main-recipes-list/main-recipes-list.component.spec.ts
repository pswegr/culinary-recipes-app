import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainRecipesListComponent } from './main-recipes-list.component';

describe('MainRecipesListComponent', () => {
  let component: MainRecipesListComponent;
  let fixture: ComponentFixture<MainRecipesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainRecipesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainRecipesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
