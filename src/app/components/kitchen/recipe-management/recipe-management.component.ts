import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, Recipe, RecipeIngredient, InventoryItem } from '../../../services/mock-data.service';

@Component({
  selector: 'app-recipe-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-management.component.html',
  styleUrl: './recipe-management.component.css'
})
export class RecipeManagementComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  recipes: Recipe[] = [];
  inventoryItems: InventoryItem[] = [];
  filteredRecipes: Recipe[] = [];
  selectedRecipe: Recipe | null = null;
  isEditing: boolean = false;
  isViewingDetails: boolean = false;
  searchTerm: string = '';
  filterType: string = 'all';
  categoryFilter: string = 'all';

  // New/Edit recipe form
  newRecipe: Recipe = this.createEmptyRecipe();

  ngOnInit(): void {
    this.loadRecipes();
    this.loadInventory();
  }

  private loadRecipes(): void {
    this.mockDataService.getRecipes().subscribe(recipes => {
      this.recipes = recipes;
      this.filterRecipes();
    });
  }

  private loadInventory(): void {
    this.mockDataService.getInventory().subscribe(inventory => {
      this.inventoryItems = inventory;
    });
  }

  private createEmptyRecipe(): Recipe {
    return {
      id: '',
      name: '',
      description: '',
      category: '',
      type: 'prepare_on_order',
      prepTime: 0,
      servings: 1,
      ingredients: [],
      instructions: [],
      costPerServing: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  filterRecipes(): void {
    let filtered = this.recipes;

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        recipe.category.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (this.filterType !== 'all') {
      filtered = filtered.filter(recipe => recipe.type === this.filterType);
    }

    // Filter by category
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === this.categoryFilter);
    }

    this.filteredRecipes = filtered;
  }

  getAverageCost(): number {
    if (this.recipes.length === 0) return 0;
    const totalCost = this.recipes.reduce((sum, recipe) => sum + recipe.costPerServing, 0);
    return Math.round(totalCost / this.recipes.length);
  }

  getPrepOnOrderCount(): number {
    return this.recipes.filter(r => r.type === 'prepare_on_order').length;
  }

  getPreparedCount(): number {
    return this.recipes.filter(r => r.type === 'prepared').length;
  }

  onSearchChange(): void {
    this.filterRecipes();
  }

  onFilterChange(): void {
    this.filterRecipes();
  }

  viewRecipe(recipe: Recipe): void {
    this.selectedRecipe = recipe;
    this.isEditing = false;
    this.isViewingDetails = true;
  }

  editRecipe(recipe: Recipe): void {
    this.selectedRecipe = { ...recipe };
    this.newRecipe = { ...recipe };
    this.isEditing = true;
  }

  createNewRecipe(): void {
    this.newRecipe = this.createEmptyRecipe();
    this.selectedRecipe = null;
    this.isEditing = true;
  }

  saveRecipe(): void {
    if (this.validateRecipe()) {
      this.newRecipe.updatedAt = new Date();
      this.calculateCost();

      if (this.newRecipe.id) {
        // Update existing recipe
        this.mockDataService.updateRecipe({ ...this.newRecipe });
      } else {
        // Create new recipe
        this.newRecipe.id = 'recipe-' + Date.now();
        this.newRecipe.createdAt = new Date();
        this.mockDataService.addRecipe({ ...this.newRecipe });
      }

      this.filterRecipes();
      this.cancelEdit();
      alert('Recipe saved successfully!');
    }
  }

  private validateRecipe(): boolean {
    if (!this.newRecipe.name.trim()) {
      alert('Recipe name is required');
      return false;
    }
    if (!this.newRecipe.category.trim()) {
      alert('Category is required');
      return false;
    }
    if (this.newRecipe.ingredients.length === 0) {
      alert('At least one ingredient is required');
      return false;
    }
    if (this.newRecipe.instructions.length === 0) {
      alert('At least one instruction is required');
      return false;
    }
    return true;
  }

  private calculateCost(): void {
    let totalCost = 0;
    this.newRecipe.ingredients.forEach(ingredient => {
      totalCost += ingredient.cost;
    });
    this.newRecipe.costPerServing = totalCost;
  }

  cancelEdit(): void {
    this.selectedRecipe = null;
    this.isEditing = false;
    this.isViewingDetails = false;
    this.newRecipe = this.createEmptyRecipe();
  }

  closeDetailsModal(): void {
    this.selectedRecipe = null;
    this.isViewingDetails = false;
  }

  deleteRecipe(recipe: Recipe): void {
    if (confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
      this.mockDataService.deleteRecipe(recipe.id);
      this.filterRecipes();
      if (this.selectedRecipe?.id === recipe.id) {
        this.selectedRecipe = null;
      }
    }
  }

  addIngredient(): void {
    this.newRecipe.ingredients.push({
      ingredientId: '',
      ingredientName: '',
      quantity: 0,
      unit: 'kg',
      cost: 0
    });
  }

  removeIngredient(index: number): void {
    this.newRecipe.ingredients.splice(index, 1);
    this.calculateCost();
  }

  onIngredientChange(index: number): void {
    const ingredient = this.newRecipe.ingredients[index];
    const inventoryItem = this.inventoryItems.find(item => item.id === ingredient.ingredientId);

    if (inventoryItem) {
      ingredient.ingredientName = inventoryItem.name;
      ingredient.unit = inventoryItem.unit;
      ingredient.cost = (ingredient.quantity * inventoryItem.unitCost);
    }

    this.calculateCost();
  }

  addInstruction(): void {
    this.newRecipe.instructions.push('');
  }

  removeInstruction(index: number): void {
    this.newRecipe.instructions.splice(index, 1);
  }

  updateInstruction(index: number, value: string): void {
    this.newRecipe.instructions[index] = value;
  }

  toggleRecipeStatus(recipe: Recipe): void {
    this.mockDataService.toggleRecipeStatus(recipe.id);
  }

  getRecipeTypeLabel(type: string): string {
    return type === 'prepared' ? 'Pre-made' : 'Prepare on Order';
  }

  getRecipeTypeClass(type: string): string {
    return type === 'prepared' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  }

  trackByRecipeId(index: number, recipe: Recipe): string {
    return recipe.id;
  }

  trackByIngredientIndex(index: number): number {
    return index;
  }

  trackByInstructionIndex(index: number): number {
    return index;
  }
}