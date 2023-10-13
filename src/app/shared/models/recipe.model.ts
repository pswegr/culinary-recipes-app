import { IngredientModel } from "./igredient.model"
import { PhotoModel } from "./photo.model";

export interface RecipeModel {
  id: string;
  title: string;
  description: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  ingredients: IngredientModel[];
  instructions: string[];
  category: string;
  imageUrl: string;
  tags: string[];
  photo: PhotoModel;
}