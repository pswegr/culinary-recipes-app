import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCartComponent } from './recipe-cart.component';

describe('RecipeCartComponent', () => {
  let component: RecipeCartComponent;
  let fixture: ComponentFixture<RecipeCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecipeCartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipeCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
