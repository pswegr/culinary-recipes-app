import { HttpEventType } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, map, tap } from 'rxjs/operators';
import { IngredientModel } from 'src/app/shared/models/igredient.model';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from 'src/app/shared/services/recipes.service';

interface UpsertRecipeState {
  recipe: RecipeModel;
  originalRecipe: RecipeModel | null;
  categories: string[];
  availableTags: string[];
  photoFile: File | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  uploadProgress: number | null;
}

interface UpsertRecipeDraft {
  version: number;
  recipe: RecipeModel;
  updatedAt: number;
}

const createEmptyRecipe = (): RecipeModel => ({
  servings: 0,
  title: '',
  id: '',
  imageUrl: '',
  category: '',
  description: '',
  preparationTime: 0,
  cookingTime: 0,
  ingredients: [],
  instructions: [],
  tags: [],
  photo: { publicId: '', url: '', mainColor: '' },
  published: false,
  likedByUsers: []
});

const DRAFT_STORAGE_PREFIX = 'upsertRecipeDraft:';
const DRAFT_VERSION = 1;

@Injectable()
export class UpsertRecipeStore {
  private readonly recipesService = inject(RecipesService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly draftKey = signal<string | null>(null);
  private readonly persistDraftEnabled = signal(false);

  private readonly state = signal<UpsertRecipeState>({
    recipe: createEmptyRecipe(),
    originalRecipe: null,
    categories: [],
    availableTags: [],
    photoFile: null,
    isLoading: false,
    isSaving: false,
    error: null,
    uploadProgress: null
  });

  private readonly categoryFilter = signal('');

  readonly recipe = computed(() => this.state().recipe);
  readonly categories = computed(() => this.state().categories);
  readonly availableTags = computed(() => this.state().availableTags);
  readonly originalRecipe = computed(() => this.state().originalRecipe);
  readonly filteredCategories = computed(() => {
    const categories = this.state().categories;
    const filterValue = this.categoryFilter().trim();
    if (!filterValue) {
      return categories;
    }
    return categories.filter(category => category.startsWith(filterValue));
  });
  readonly isLoading = computed(() => this.state().isLoading);
  readonly isSaving = computed(() => this.state().isSaving);
  readonly error = computed(() => this.state().error);
  readonly uploadProgress = computed(() => this.state().uploadProgress);

  init(recipeId: string | null): void {
    this.categoryFilter.set('');
    const draftKey = this.buildDraftKey(recipeId);
    this.draftKey.set(draftKey);
    this.persistDraftEnabled.set(true);
    this.state.update(state => ({
      ...state,
      photoFile: null,
      originalRecipe: null,
      uploadProgress: null,
      error: null
    }));

    this.loadCategories();
    this.loadTags();

    const draft = this.loadDraft(draftKey);
    if (draft) {
      this.state.update(state => ({
        ...state,
        recipe: draft.recipe
      }));
    }

    if (recipeId) {
      this.loadRecipe(recipeId, !draft);
      return;
    }

    if (!draft) {
      this.resetRecipe();
    }
  }

  setCategoryFilter(value: string): void {
    this.categoryFilter.set(value ?? '');
  }

  setPhotoFile(file: File | null): void {
    this.state.update(state => ({ ...state, photoFile: file }));
  }

  updateRecipeField<K extends keyof RecipeModel>(key: K, value: RecipeModel[K]): void {
    this.state.update(state => ({
      ...state,
      recipe: {
        ...state.recipe,
        [key]: value
      }
    }));
    this.persistDraft();
  }

  setInstructions(instructions: string[]): void {
    this.state.update(state => ({
      ...state,
      recipe: {
        ...state.recipe,
        instructions: [...instructions]
      }
    }));
    this.persistDraft();
  }

  addInstruction(instruction: string): void {
    this.state.update(state => ({
      ...state,
      recipe: {
        ...state.recipe,
        instructions: [...state.recipe.instructions, instruction]
      }
    }));
    this.persistDraft();
  }

  removeInstruction(index: number): void {
    this.state.update(state => ({
      ...state,
      recipe: {
        ...state.recipe,
        instructions: state.recipe.instructions.filter((_, i) => i !== index)
      }
    }));
    this.persistDraft();
  }

  addIngredient(ingredient: IngredientModel): void {
    this.state.update(state => ({
      ...state,
      recipe: {
        ...state.recipe,
        ingredients: [...state.recipe.ingredients, { ...ingredient }]
      }
    }));
    this.persistDraft();
  }

  removeIngredient(index: number): void {
    this.state.update(state => ({
      ...state,
      recipe: {
        ...state.recipe,
        ingredients: state.recipe.ingredients.filter((_, i) => i !== index)
      }
    }));
    this.persistDraft();
  }

  addTag(tag: string): void {
    this.state.update(state => ({
      ...state,
      recipe: {
        ...state.recipe,
        tags: [...state.recipe.tags, tag]
      }
    }));
    this.persistDraft();
  }

  removeTag(tag: string): void {
    this.state.update(state => {
      const tags = [...state.recipe.tags];
      const index = tags.indexOf(tag);
      if (index > -1) {
        tags.splice(index, 1);
      }
      return {
        ...state,
        recipe: {
          ...state.recipe,
          tags
        }
      };
    });
    this.persistDraft();
  }

  revertToOriginal(): void {
    const originalRecipe = this.state().originalRecipe;
    if (!originalRecipe) {
      this.resetRecipe();
      return;
    }
    this.state.update(state => ({
      ...state,
      recipe: this.cloneRecipe(originalRecipe),
      photoFile: null
    }));
    this.categoryFilter.set(originalRecipe.category ?? '');
    this.persistDraft();
  }

  upsertRecipe(): Observable<void> {
    const formData = new FormData();
    const { recipe, photoFile } = this.state();
    formData.append('recipe', JSON.stringify(recipe));
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    this.state.update(state => ({
      ...state,
      isSaving: true,
      uploadProgress: null,
      error: null
    }));

    return this.recipesService.upsertRecipe(formData).pipe(
      tap((event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round(100 * (event.loaded / event.total));
          this.state.update(state => ({
            ...state,
            uploadProgress: progress
          }));
        }
      }),
      filter((event: any) => event.type === HttpEventType.Response),
      map(() => {
        this.clearDraft();
        return void 0;
      }),
      catchError((error) => {
        this.state.update(state => ({
          ...state,
          error: 'Failed to save recipe.'
        }));
        return throwError(() => error);
      }),
      finalize(() => {
        this.state.update(state => ({
          ...state,
          isSaving: false,
          uploadProgress: null
        }));
      })
    );
  }

  private loadCategories(): void {
    this.recipesService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: categories => {
          this.state.update(state => ({
            ...state,
            categories
          }));
        },
        error: () => {
          this.state.update(state => ({
            ...state,
            error: 'Failed to load categories.'
          }));
        }
      });
  }

  private loadTags(): void {
    this.recipesService
      .getTagsUpsertRecipe()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: tags => {
          this.state.update(state => ({
            ...state,
            availableTags: tags
          }));
        },
        error: () => {
          this.state.update(state => ({
            ...state,
            error: 'Failed to load tags.'
          }));
        }
      });
  }

  private loadRecipe(id: string, applyToRecipe: boolean): void {
    this.state.update(state => ({
      ...state,
      isLoading: true,
      error: null
    }));

    this.recipesService
      .getRecipe(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.state.update(state => ({
            ...state,
            isLoading: false
          }));
        })
      )
      .subscribe({
        next: recipe => {
          const clonedRecipe = this.cloneRecipe(recipe);
          this.state.update(state => ({
            ...state,
            originalRecipe: clonedRecipe,
            recipe: applyToRecipe ? clonedRecipe : state.recipe
          }));
          if (applyToRecipe) {
            this.persistDraft();
          }
        },
        error: () => {
          this.state.update(state => ({
            ...state,
            error: 'Failed to load recipe.'
          }));
        }
      });
  }

  private resetRecipe(): void {
    this.state.update(state => ({
      ...state,
      recipe: createEmptyRecipe(),
      photoFile: null
    }));
    this.categoryFilter.set('');
    this.persistDraft();
  }

  private cloneRecipe(recipe: RecipeModel): RecipeModel {
    return JSON.parse(JSON.stringify(recipe)) as RecipeModel;
  }

  private persistDraft(): void {
    if (!this.persistDraftEnabled()) {
      return;
    }
    const key = this.draftKey();
    if (!key || !this.isStorageAvailable()) {
      return;
    }

    const draft: UpsertRecipeDraft = {
      version: DRAFT_VERSION,
      recipe: this.state().recipe,
      updatedAt: Date.now()
    };

    try {
      localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      // Ignore storage errors (quota, private mode).
    }
  }

  private loadDraft(key: string): UpsertRecipeDraft | null {
    if (!this.isStorageAvailable()) {
      return null;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      const draft = JSON.parse(raw) as UpsertRecipeDraft;
      if (!draft || draft.version !== DRAFT_VERSION || !draft.recipe) {
        localStorage.removeItem(key);
        return null;
      }
      return draft;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  private clearDraft(): void {
    const key = this.draftKey();
    if (!key || !this.isStorageAvailable()) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
  }

  private buildDraftKey(recipeId: string | null): string {
    return `${DRAFT_STORAGE_PREFIX}${recipeId ?? 'new'}`;
  }

  private isStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
