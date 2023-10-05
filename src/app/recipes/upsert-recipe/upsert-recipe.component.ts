import { Component, OnDestroy, OnInit, ViewChild, effect } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { IngredientModel } from 'src/app/shared/models/igredient.model';
import { RecipesService } from '../services/recipes.service';
import { Observable,  Subject,  filter,  map, of, share, switchMap } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-upsert-recipe',
  templateUrl: './upsert-recipe.component.html',
  styleUrls: ['./upsert-recipe.component.scss']
})
export class UpsertRecipeComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') myStepper!: MatStepper;
  recipeId: string | null = null;
  isHandsetPortrait: boolean = false;
  stepperOrientation: Observable<StepperOrientation> = of('vertical');
  disableSafe: boolean = true;
  isDarkMode: boolean = true;

  destroy$ = new Subject<void>()

  $recipe: Observable<RecipeModel> = this.route.paramMap.pipe(
    takeUntil(this.destroy$),
    filter(p => p.get('id') !== null),
    map(p => p.get('id') ?? ''),
    switchMap(id => this.recipesService.getRecipe(id))
  ).pipe(share());

  $tags = this.recipesService.getTags().pipe(takeUntil(this.destroy$))

  recipe: RecipeModel = {servings: 0, title: '', id: '', imageUrl: '', category: '', description: '', preparationTime: 0, cookingTime: 0, ingredients: [], instructions: [], tags: [] };
  newInstruction: string = '';
  newIngredient: IngredientModel = {name: '', quantity: ''};
  
  categories: string[] = [];
  filteredOptions: string[] = [];

  

  constructor(breakpointObserver: BreakpointObserver, 
    private route: ActivatedRoute,
    private recipesService: RecipesService,
    private themeModeService: ThemeModeService){
    this.stepperOrientation = breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait
      ])
      .pipe(map(({matches}) => (matches ? 'vertical' : 'horizontal')));
    
  
    effect(() => {
      this.isDarkMode = this.themeModeService.isDark();
    }) 
   }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
   
  ngOnInit(): void {
    this.$recipe.pipe(takeUntil(this.destroy$)).subscribe(x => this.recipe = x)

    this.recipesService.getCategories().pipe(takeUntil(this.destroy$)).subscribe(x => {
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
