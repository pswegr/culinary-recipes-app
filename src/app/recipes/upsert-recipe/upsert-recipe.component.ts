import { Component, ElementRef, OnDestroy, OnInit, ViewChild, effect, inject } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { IngredientModel } from 'src/app/shared/models/igredient.model';
import { RecipesService } from '../../shared/services/recipes.service';
import { Observable,  Subject,  Subscription,  filter,  map, of, share, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { FileInputComponent } from './custom-controls/file-input/file-input.component';
import { HttpEventType } from '@angular/common/http';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-upsert-recipe',
  templateUrl: './upsert-recipe.component.html',
  styleUrls: ['./upsert-recipe.component.scss']
})
export class UpsertRecipeComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') myStepper!: MatStepper;
  @ViewChild(FileInputComponent) fileInput: FileInputComponent | null = null;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  tagCtrl = new FormControl('');
  recipeId: string | null = null;
  isHandsetPortrait: boolean = false;
  stepperOrientation: Observable<StepperOrientation> = of('vertical');
  disableSafe: boolean = true;
  isDarkMode: boolean = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  destroy$ = new Subject<void>();
  uploadSub: Subscription = new Subscription();

  $recipe: Observable<RecipeModel> = this.route.paramMap.pipe(
    takeUntil(this.destroy$),
    filter(p => p.get('recipeId') !== null),
    map(p => p.get('recipeId') ?? ''),
    switchMap(id => this.recipesService.getRecipe(id))
  ).pipe(share());

  $tags = this.recipesService.getTags().pipe(takeUntil(this.destroy$))

  recipe: RecipeModel = {servings: 0, title: '', id: '', imageUrl: '', category: '', description: '', preparationTime: 0, cookingTime: 0, ingredients: [], instructions: [], tags: [], photo: {publicId: '', url: '', mainColor: ''}, published: false, likedByUsers: [] };
  newInstruction: string = '';
  newIngredient: IngredientModel = {name: '', quantity: ''};
  
  categories: string[] = [];
  filteredOptions: string[] = [];
  photoUploaded: File | null = null;
  

  constructor(breakpointObserver: BreakpointObserver, 
    private route: ActivatedRoute,
    private router: Router,
    private recipesService: RecipesService,
    private themeModeService: ThemeModeService,
    private announcer: LiveAnnouncer){
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
    const formData = new FormData();
    formData.append('recipe', JSON.stringify(this.recipe));
    if (this.photoUploaded) {
      formData.append('photo', this.photoUploaded);
    }
      const upload$ = this.recipesService.upsertRecipe(formData)
      .pipe(
          finalize(() => this.fileInput?.reset())
      );
    
      this.uploadSub = upload$.subscribe(event => {
        if (event.type == HttpEventType.UploadProgress && event.total) {
          if(this.fileInput){
            this.fileInput.uploadProgress = Math.round(100 * (event.loaded / event.total));
          }
        }
        this.router.navigate(['']);
      })
    
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

  uploadedFile(event: File | null){
    this.photoUploaded = event;
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.recipe.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.recipe.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.recipe.tags.indexOf(tag);

    if (index >= 0) {
      this.recipe.tags.splice(index, 1);

      this.announcer.announce(`Removed ${tag}`);
    }
  }
}
