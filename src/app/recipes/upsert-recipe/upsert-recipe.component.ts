import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import { IngredientModel } from 'src/app/shared/models/igredient.model';
import { RecipesService } from '../services/recipes.service';
import { Observable,  map, of } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-upsert-recipe',
  templateUrl: './upsert-recipe.component.html',
  styleUrls: ['./upsert-recipe.component.scss']
})
export class UpsertRecipeComponent implements OnInit {
  @ViewChild('stepper') myStepper!: MatStepper;
  recipeId: string | null = null;
  isHandsetPortrait: boolean = false;
  stepperOrientation: Observable<StepperOrientation> = of('vertical');
  disableSafe: boolean = true;

  recipe: RecipeModel = {servings: 0, title: '', id: '', imageUrl: '', category: '', description: '', preparationTime: 0, cookingTime: 0, ingredients: [], instructions: [] };
  newInstruction: string = '';
  newIngredient: IngredientModel = {name: '', quantity: ''};
  
  categories: string[] = [];
  filteredOptions: string[] = [];

  constructor(breakpointObserver: BreakpointObserver, 
    private route: ActivatedRoute, 
    private recipesService: RecipesService){
    this.stepperOrientation = breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait
      ])
      .pipe(map(({matches}) => (matches ? 'vertical' : 'horizontal')));
   }

   
  ngOnInit(): void {
    this.route.paramMap.subscribe(
    (params : ParamMap) => {
      this.recipeId = params.get('id');
    });
    if(this.recipeId){
      this.recipesService.getRecipe(this.recipeId).subscribe(x => this.recipe = x);
    }
    this.recipesService.getCategories().subscribe(x => {
      this.categories = x;
      this.filteredOptions = this.categories
    });
  }

  categoryChanged(event: string): void {
    if(event !== ''){
      this.filteredOptions = this.categories.filter(x => x.startsWith(event));
    }
    else{
      this.filteredOptions = this.categories;
    }
  }


  checkCompletion(){
    console.log(this.myStepper.steps.toArray().filter(x => x.completed === false).length > 1);
    this.disableSafe = this.myStepper.steps.toArray().filter(x => x.completed === false).length > 1;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.recipe.instructions, event.previousIndex, event.currentIndex);
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  addNewInstruction(){
    this.recipe.instructions.push(structuredClone(this.newInstruction))
    this.newInstruction = '';
  }

  save(){
    console.log(this.recipe);
  }

  deleteInstruction(index: number)
  {
    if (index > -1) {
      this.recipe.instructions.splice(index, 1);
    }
  }

  editInstruction(index: number)
  {
    this.newInstruction = this.recipe.instructions[index];

    if (index > -1) {
      this.recipe.instructions.splice(index, 1);
    }
  }

  addNewIngrdient() {
    this.recipe.ingredients.push(this.newIngredient);
    this.newIngredient = {name: '', quantity: ''};
  }

  editIngredient(index: number) {
    this.newIngredient = this.recipe.ingredients[index];

    if(index > -1) {
      this.recipe.ingredients.splice(index, 1);
    }
  }

  deleteIngredient(index: number) {
    if(index > -1) {
      this.recipe.ingredients.splice(index, 1);
    }
  }
}
