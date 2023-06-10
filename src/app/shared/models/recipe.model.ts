import { IngredientModel } from "./igredient.model"

export interface RecipeModel {
  id: string;
  title: string;
  description: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  ingredients: IngredientModel[];
  instructions: string[];
}