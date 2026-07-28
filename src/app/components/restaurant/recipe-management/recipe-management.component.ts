import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { CrudService } from '../../../services/crud.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-management.component.html',
  styleUrl: './recipe-management.component.css'
})
export class RecipeManagementComponent implements OnInit {
  recipes: any[] = [];
  inventoryItems: any[] = [];
  menuItems: any[] = [];
  showForm = false;
  isSubmitting = false;
  errorMessage = '';
  editingRecipe: any = null;

  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 50;
  totalPages = 1;
  totalElements = 0;
  searchDebounceMs = 300;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];
  isLoading = false;

  recipeForm: any = {
    id: 0,
    recipe_id: '',
    name: '',
    description: '',
    serving_size: null,
    preparation_time_minutes: null,
    cooking_time_minutes: null,
    total_time_minutes: null,
    difficulty_level: 'EASY',
    is_active: true,
    menu_item_id: null,
    restaurant_id: 1,
    ingredients: []
  };

  currentIngredient: any = {
    inventoryItemId: null,
    ingredientName: '',
    quantity: null,
    unit: 'pcs',
    is_optional: false
  };
  editingIngredientIndex: number | null = null;

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
    this.loadInventoryItems();
    this.loadMenuItems();
    this.setupSearch();
  }

  private buildParams(): any {
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      restaurant_id: currentUser?.restaurantId,
      page: this.currentPage,
      size: this.itemsPerPage
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    return params;
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(this.searchDebounceMs),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.loadRecipesObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.recipes = response.data || [];
        this.currentPage = response.currentPage || this.currentPage;
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching recipes:', error);
        this.loadingService.hide();
      }
    });
  }

  private loadRecipesObservable(params: any) {
    return this.crudService.getRecipes(params);
  }

  loadRecipes(): void {
    this.isLoading = true;
    this.loadingService.show();
    const params = this.buildParams();
    this.loadRecipesObservable(params).subscribe({
      next: (response: any) => {
        this.recipes = response.data || [];
        this.currentPage = response.currentPage || this.currentPage;
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load recipes';
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  loadInventoryItems(): void {
    const currentUser = this.authService.getCurrentUser();
    this.crudService.getInventoryItems({
      page: 1,
      size: 100,
      restaurant_id: currentUser?.restaurantId,
      isActive: 'true'
    }).subscribe({
      next: (response: any) => {
        this.inventoryItems = response.data || [];
      },
      error: (error) => {
        console.error('Failed to load inventory items', error);
      }
    });
  }

  loadMenuItems(): void {
    const currentUser = this.authService.getCurrentUser();
    this.crudService.getMenuItems({
      page: 1,
      size: 9999,
      restaurant_id: currentUser?.restaurantId || 1
    }).subscribe({
      next: (response: any) => {
        this.menuItems = response.data || [];
      },
      error: (error) => {
        console.error('Failed to load menu items', error);
      }
    });
  }

  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchInput = '';
      this.searchSubject.next('');
    }
  }

  onSearchInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  showAddForm(): void {
    this.editingRecipe = null;
    this.recipeForm = {
      id: 0,
      recipe_id: 'REC-' + Date.now(),
      name: '',
      description: '',
      serving_size: null,
      preparation_time_minutes: null,
      cooking_time_minutes: null,
      total_time_minutes: null,
      difficulty_level: 'EASY',
      is_active: true,
      menu_item_id: null,
      restaurant_id: 1,
      ingredients: []
    };
    this.resetCurrentIngredient();
    this.showForm = true;
  }

  editRecipe(recipe: any): void {
    this.editingRecipe = recipe;
    this.recipeForm = { ...recipe };
    this.resetCurrentIngredient();
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingRecipe = null;
    this.errorMessage = '';
    this.resetCurrentIngredient();
  }

  addIngredientRow(): void {
    const ingredientId = this.currentIngredient.ingredient_id || 'ing-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const data = {
      ingredient_id: ingredientId,
      inventory_item_id: this.currentIngredient.inventoryItemId,
      ingredient_name: this.currentIngredient.ingredientName,
      quantity: this.currentIngredient.quantity,
      unit: this.currentIngredient.unit,
      is_optional: false
    };

    if (!data.inventory_item_id && data.inventory_item_id !== 0) {
      this.notificationService.error('Validation Error', 'Inventory Item is required');
      return;
    }

    if (!data.ingredient_name || !data.ingredient_name.trim()) {
      this.notificationService.error('Validation Error', 'Ingredient Name is required');
      return;
    }

    if (data.quantity === null || data.quantity === undefined || data.quantity === '') {
      this.notificationService.error('Validation Error', 'Quantity is required');
      return;
    }

    if (!data.unit) {
      this.notificationService.error('Validation Error', 'Unit is required');
      return;
    }

    if (this.editingIngredientIndex !== null) {
      this.recipeForm.ingredients[this.editingIngredientIndex] = data;
      this.editingIngredientIndex = null;
    } else {
      this.recipeForm.ingredients.push(data);
    }

    this.resetCurrentIngredient();
  }

  resetCurrentIngredient(): void {
    this.currentIngredient = {
      inventoryItemId: null,
      ingredientName: '',
      quantity: null,
      unit: 'pcs',
      is_optional: false,
      ingredient_id: null
    };
    this.editingIngredientIndex = null;
  }

  onInventoryItemChange(itemId: number | null | undefined): void {
    if (!itemId && itemId !== 0) {
      this.currentIngredient.ingredientName = '';
      this.currentIngredient.quantity = null;
      this.currentIngredient.unit = 'pcs';
      return;
    }

    const item = this.inventoryItems.find(i => i.id === itemId);
    if (item) {
      this.currentIngredient.ingredientName = item.name || '';
      this.currentIngredient.unit = item.unit_of_measure || 'pcs';
      this.currentIngredient.quantity = 1;
    }
  }

  editIngredientRow(index: number): void {
    const row = this.recipeForm.ingredients[index];
    this.currentIngredient = {
      inventoryItemId: row.inventory_item_id,
      ingredientName: row.ingredient_name,
      quantity: row.quantity,
      unit: row.unit,
      is_optional: row.is_optional,
      ingredient_id: row.ingredient_id
    };
    this.editingIngredientIndex = index;
  }

  getInventoryItemName(id: number | null | undefined): string {
    if (!id) return '-';
    const item = this.inventoryItems.find(i => i.id === id);
    return item ? item.name : 'Unknown';
  }

  removeIngredientRow(index: number): void {
    this.recipeForm.ingredients.splice(index, 1);
    if (this.editingIngredientIndex === index) {
      this.resetCurrentIngredient();
    }
  }

  onSubmitForm(): void {
    if (this.isSubmitting) return;

    if (!this.recipeForm.name || !this.recipeForm.name.trim()) {
      this.notificationService.error('Validation Error', 'Recipe Name is required');
      return;
    }

    if (!this.recipeForm.description || !this.recipeForm.description.trim()) {
      this.notificationService.error('Validation Error', 'Description is required');
      return;
    }

    if (!this.recipeForm.menu_item_id) {
      this.notificationService.error('Validation Error', 'Menu Item is required');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const payload = {
      ...this.recipeForm,
      restaurant_id: currentUser?.restaurantId || 1,
      created_by: Number(currentUser?.id) || 1,
      updated_by: Number(currentUser?.id) || 1
    };

    this.isSubmitting = true;
    this.loadingService.show();

    const request = this.editingRecipe
      ? this.crudService.updateRecipe(this.editingRecipe.id, payload)
      : this.crudService.createRecipe(payload);

    request.subscribe({
      next: (response) => {
        this.notificationService.success(
          this.editingRecipe ? 'Recipe Updated' : 'Recipe Created',
          'Recipe saved successfully'
        );
        this.cancelForm();
        this.loadRecipes();
        this.isSubmitting = false;
        this.loadingService.hide();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to save recipe';
        this.notificationService.error('Error', this.errorMessage);
        this.isSubmitting = false;
        this.loadingService.hide();
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRecipes();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadRecipes();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    if (this.totalElements === 0) return '0-0';
    return `${start}-${end}`;
  }

  deleteRecipe(recipe: any): void {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.crudService.deleteRecipe(recipe.id).subscribe({
        next: () => {
          this.notificationService.success('Deleted', 'Recipe deleted successfully');
          this.loadRecipes();
        },
        error: (error) => {
          this.notificationService.error('Error', error.error?.message || 'Failed to delete recipe');
        }
      });
    }
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'HARD': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'EXPERT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  getDifficultyIcon(difficulty: string): string {
    switch (difficulty) {
      case 'EASY': return 'fas fa-seedling';
      case 'MEDIUM': return 'fas fa-fire';
      case 'HARD': return 'fas fa-fire-alt';
      case 'EXPERT': return 'fas fa-crown';
      default: return 'fas fa-circle';
    }
  }
}
