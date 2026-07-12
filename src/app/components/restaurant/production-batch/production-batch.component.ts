import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { CrudService } from '../../../services/crud.service';
import { RecipeProduction, ProductionBatch } from '../../../interfaces';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-production-batch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './production-batch.component.html',
  styleUrl: './production-batch.component.css'
})
export class ProductionBatchComponent implements OnInit {
  recipeProductions: RecipeProduction[] = [];
  selectedProduction: RecipeProduction | null = null;
  productionBatchDetails: ProductionBatch[] = [];
  recipes: any[] = [];
  selectedRecipe: any = null;
  searchTerm = '';
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  fieldErrors: { [key: string]: string } = {};

  isSubmitting = false;
  showProduceForm = false;

  produceForm: any = {
    menu_item_id: null,
    batch_multiplier: 1,
    note: 'Batch production from owner panel'
  };

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private confirmationService: ConfirmationDialogService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.loadRecipeProductions();
    this.setupSearch();
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loadingService.show();
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId ?? 1;
    this.crudService.getRecipes({
      page: 1,
      size: 9999,
      restaurant_id: restaurantId
    }).subscribe({
      next: (response: any) => {
        this.recipes = response.data || [];
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
        this.loadingService.hide();
      }
    });
  }

  loadRecipeProductions(): void {
    this.loadingService.show();
    this.errorMessage = '';

    this.getRecipeProductionsObservable(this.buildParams()).subscribe({
      next: (response: any) => {
        this.recipeProductions = this.mapApiRecipeProductionsToRecipeProductions(response.data);
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading recipe productions:', error);
        const apiMessage = error.error?.message || 'Failed to load recipe productions. Please try again.';
        this.errorMessage = apiMessage;
        this.loadingService.hide();
      }
    });
  }

  private getRecipeProductionsObservable(params: any): Observable<any> {
    return this.crudService.getRecipeProductions(params);
  }

  private buildParams(): any {
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurant_id: currentUser?.restaurantId
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }

    return params;
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.getRecipeProductionsObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.recipeProductions = this.mapApiRecipeProductionsToRecipeProductions(response.data);
        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching recipe productions:', error);
        this.loadingService.hide();
      }
    });
  }

  private mapApiRecipeProductionsToRecipeProductions(apiRecipeProductions: any[]): RecipeProduction[] {
    return apiRecipeProductions.map(apiRecipeProduction => ({
      id: apiRecipeProduction.id,
      recipe_id: apiRecipeProduction.recipe_id,
      menu_item_id: apiRecipeProduction.menu_item_id,
      restaurant_id: apiRecipeProduction.restaurant_id,
      batch_multiplier: apiRecipeProduction.batch_multiplier || 1,
      note: apiRecipeProduction.note || '',
      created_by: apiRecipeProduction.created_by,
      created_at: apiRecipeProduction.created_at ? new Date(apiRecipeProduction.created_at) : new Date()
    }));
  }

  loadProductionBatchDetails(production: RecipeProduction): void {
    this.loadingService.show();
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = currentUser?.restaurantId ?? 1;

    this.crudService.getStockLogs({
      page: 1,
      size: 9999,
      restaurant_id: restaurantId,
      type: 'PRODUCTION',
      batch_id: production.id
    }).subscribe({
      next: (response: any) => {
        this.productionBatchDetails = this.mapApiProductionBatchesToProductionBatches(response.data || []);
        this.selectedProduction = production;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading production batch details:', error);
        this.productionBatchDetails = [];
        this.selectedProduction = production;
        this.loadingService.hide();
      }
    });
  }

  private mapApiProductionBatchesToProductionBatches(apiProductionBatches: any[]): ProductionBatch[] {
    return apiProductionBatches.map(apiProductionBatch => ({
      id: apiProductionBatch.id,
      type: apiProductionBatch.type || 'PRODUCTION',
      inventory_item_id: apiProductionBatch.inventory_item_id || 0,
      inventory_item_name: apiProductionBatch.inventory_item_name || apiProductionBatch.menu_item_name || 'Unknown Item',
      menu_item_id: apiProductionBatch.menu_item_id,
      menu_item_name: apiProductionBatch.menu_item_name || apiProductionBatch.inventory_item_name || 'Unknown Item',
      quantity_change: apiProductionBatch.quantity_change || 0,
      balance_after: apiProductionBatch.balance_after || 0,
      note: apiProductionBatch.note || '',
      created_at: apiProductionBatch.created_at ? new Date(apiProductionBatch.created_at) : new Date(),
      created_by: apiProductionBatch.created_by,
      restaurant_id: apiProductionBatch.restaurant_id || this.authService.getCurrentUser()?.restaurantId || 1
    }));
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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRecipeProductions();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadRecipeProductions();
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

  get hasActiveFilters(): boolean {
    return !!this.searchTerm?.trim();
  }

  showProduceFormOverlay(): void {
    this.showProduceForm = true;
    this.selectedRecipe = null;
    this.produceForm = {
      menu_item_id: null,
      batch_multiplier: 1,
      note: 'Batch production from owner panel'
    };
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  cancelProduce(): void {
    this.showProduceForm = false;
    this.selectedRecipe = null;
    this.produceForm = {
      menu_item_id: null,
      batch_multiplier: 1,
      note: 'Batch production from owner panel'
    };
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onRecipeChange(): void {
    this.produceForm.menu_item_id = this.selectedRecipe?.menu_item_id || null;
    this.produceForm.batch_multiplier = 1;
  }

  validateRecipe(): void {
    if (!this.produceForm.menu_item_id) {
      this.fieldErrors['menu_item_id'] = 'Please select a recipe';
    } else {
      delete this.fieldErrors['menu_item_id'];
    }
  }

  validateBatchQuantity(): void {
    const value = this.produceForm.batch_multiplier;
    if (value === null || value === undefined || isNaN(value) || value < 1) {
      this.fieldErrors['batch_multiplier'] = 'Batch quantity must be at least 1';
    } else {
      delete this.fieldErrors['batch_multiplier'];
    }
  }

  onSubmitForm(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.fieldErrors = {};
    this.errorMessage = '';

    this.produceForm.menu_item_id = this.selectedRecipe?.menu_item_id || null;
    this.validateRecipe();
    this.validateBatchQuantity();

    if (Object.keys(this.fieldErrors).length > 0) {
      this.isSubmitting = false;
      return;
    }

    this.produceBatch();
  }

  async produceBatch(): Promise<void> {
    if (!this.selectedRecipe) {
      this.notificationService.error('Invalid', 'Please select a valid recipe');
      this.isSubmitting = false;
      return;
    }

    const confirmed = await this.confirmationService.confirm(
      `This action can't be undone due to inventory deductions. Are you sure you want to proceed?`,
      'Recipe Production Warning',
      'Proceed',
      'Cancel'
    );

    if (!confirmed) {
      this.isSubmitting = false;
      return;
    }

    this.loadingService.show();

    this.crudService.produceRecipe({
      menu_item_id: this.produceForm.menu_item_id,
      batch_multiplier: this.produceForm.batch_multiplier,
      note: this.produceForm.note || 'Batch production from owner panel'
    }).subscribe({
      next: (response) => {
        this.notificationService.success('Production Complete', `Successfully produced ${this.produceForm.batch_multiplier} batch(es)`);
        this.isSubmitting = false;
        this.loadingService.hide();
        this.cancelProduce();
        this.loadRecipeProductions();
      },
      error: (error) => {
        this.isSubmitting = false;
        const apiMessage = error.error?.message || 'Production failed';
        this.errorMessage = apiMessage;
        this.notificationService.error('Production Failed', apiMessage);
        this.loadingService.hide();
      }
    });
  }

  selectProduction(production: RecipeProduction): void {
    this.loadProductionBatchDetails(production);
  }

  closeDetails(): void {
    this.selectedProduction = null;
    this.productionBatchDetails = [];
  }

  refresh(): void {
    this.loadRecipeProductions();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.searchInput = '';
    this.searchSubject.next('');
    this.currentPage = 1;
    this.loadRecipeProductions();
  }

  getRecipeName(recipeId: number): string {
    const recipe = this.recipes.find((r: any) => r.id === recipeId);
    return recipe ? recipe.name : 'Unknown Recipe';
  }

  Math = Math;
}
