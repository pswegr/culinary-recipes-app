import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesAllListComponent } from './recipes-all-list.component';

describe('RecipesAllListComponent', () => {
  let component: RecipesAllListComponent;
  let fixture: ComponentFixture<RecipesAllListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecipesAllListComponent]
    });
    fixture = TestBed.createComponent(RecipesAllListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
