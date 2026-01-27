import { Component, ElementRef, OnDestroy, OnInit, ViewChild, effect } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { IngredientModel } from 'src/app/shared/models/igredient.model';
import { Observable, Subject, Subscription, map, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { FileInputComponent } from './custom-controls/file-input/file-input.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UpsertRecipeStore } from './upsert-recipe.store';

@Component({
    selector: 'app-upsert-recipe',
    templateUrl: './upsert-recipe.component.html',
    styleUrls: ['./upsert-recipe.component.scss'],
    providers: [UpsertRecipeStore],
    standalone: false
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

  readonly recipe = this.upsertRecipeStore.recipe;
  readonly filteredOptions = this.upsertRecipeStore.filteredCategories;
  readonly availableTags = this.upsertRecipeStore.availableTags;

  newInstruction: string = '';
  newIngredient: IngredientModel = {name: '', quantity: '', unit: ''};

  constructor(breakpointObserver: BreakpointObserver, 
    private route: ActivatedRoute,
    private router: Router,
    private upsertRecipeStore: UpsertRecipeStore,
    private themeModeService: ThemeModeService,
    private announcer: LiveAnnouncer){
    this.stepperOrientation = breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait
      ])
      .pipe(map(({matches}) => (matches ? 'vertical' : 'horizontal')));
    
  
    effect(() => {
      this.isDarkMode = this.themeModeService.isDark();
    });

    effect(() => {
      const progress = this.upsertRecipeStore.uploadProgress();
      if (this.fileInput) {
        this.fileInput.uploadProgress = progress;
      }
    });
   }

  ngOnDestroy(): void {
    this.uploadSub.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
   
  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.recipeId = params.get('recipeId');
        this.upsertRecipeStore.init(this.recipeId);
      });
  }

  categoryChanged(event: string): void {
    this.upsertRecipeStore.updateRecipeField('category', event);
    this.upsertRecipeStore.setCategoryFilter(event);
  }

  updateRecipeField<K extends keyof RecipeModel>(key: K, value: RecipeModel[K]): void {
    this.upsertRecipeStore.updateRecipeField(key, value);
  }

  revertChanges(): void {
    this.upsertRecipeStore.revertToOriginal();
    this.fileInput?.reset();
  }

  checkCompletion(){
    this.disableSafe = this.myStepper.steps.toArray().filter(x => x.completed === false).length > 1;
  }

  drop(event: CdkDragDrop<string[]>) {
    const instructions = [...this.recipe().instructions];
    moveItemInArray(instructions, event.previousIndex, event.currentIndex);
    this.upsertRecipeStore.setInstructions(instructions);
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  addNewInstruction(){
    this.upsertRecipeStore.addInstruction(this.newInstruction);
    this.newInstruction = '';
  }

  save(){
    this.uploadSub.unsubscribe();
    this.uploadSub = this.upsertRecipeStore.upsertRecipe()
      .pipe(
        finalize(() => this.fileInput?.reset())
      )
      .subscribe({
        next: () => this.router.navigate([''])
      });
  }

  deleteInstruction(index: number)
  {
    this.upsertRecipeStore.removeInstruction(index);
  }

  editInstruction(index: number)
  {
    const instruction = this.recipe().instructions[index];
    if (instruction !== undefined) {
      this.newInstruction = instruction;
      this.upsertRecipeStore.removeInstruction(index);
    }
  }

  addNewIngrdient() {
    this.upsertRecipeStore.addIngredient(this.newIngredient);
    this.newIngredient = {name: '', quantity: '', unit: ''};
  }

  editIngredient(index: number) {
    const ingredient = this.recipe().ingredients[index];
    if (ingredient) {
      this.newIngredient = { ...ingredient };
      this.upsertRecipeStore.removeIngredient(index);
    }
  }

  deleteIngredient(index: number) {
    this.upsertRecipeStore.removeIngredient(index);
  }

  uploadedFile(event: File | null){
    this.upsertRecipeStore.setPhotoFile(event);
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.upsertRecipeStore.addTag(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.upsertRecipeStore.addTag(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
  }

  removeTag(tag: string): void {
    this.upsertRecipeStore.removeTag(tag);
    this.announcer.announce(`Removed ${tag}`);
  }
}
