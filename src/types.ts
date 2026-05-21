/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NutritionInfo {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

export interface MealData {
  id: string;
  schoolName: string;
  date: Date;
  dateKey: string;
  dayOfWeek: string;
  mealType: 'lunch' | 'dinner';
  title: string;
  dishes: string[];
  totalCalories: number;
  nutrition: NutritionInfo;
  allergens: string[];
}

export type TabType = 'home' | 'meals' | 'calc' | 'profile';

export interface StudentProfile {
  name: string;
  gradeClass: string;
  allergies: string[];
  allergyAlertEnabled: boolean;
  dailyAlertEnabled: boolean;
  avatarUrl: string;
}
