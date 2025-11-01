import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { CrudService, ApiResponse } from './crud.service';
import { ValidationService } from './validation.service';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  preparationTime: number;
  allergens?: string[];
  customizations?: MenuCustomization[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCustomization {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {
  private readonly MENU_ENDPOINT = 'menu';
  private readonly CATEGORY_ENDPOINT = 'menu/categories';

  constructor(
    private crudService: CrudService,
    private validationService: ValidationService
  ) {}

  // ===============================
  // MENU ITEM OPERATIONS
  // ===============================

  /**
   * Get all menu items with optional filtering
   */
  getMenuItems(params?: {
    category?: string;
    isAvailable?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Observable<MenuItem[]> {
    return this.crudService.getData(this.MENU_ENDPOINT, params).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data.map((item: any) => this.mapMenuItemResponse(item));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get menu item by ID
   */
  getMenuItemById(id: string): Observable<MenuItem | null> {
    return this.crudService.getData(`${this.MENU_ENDPOINT}/${id}`).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapMenuItemResponse(response.data);
        }
        return null;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create new menu item
   */
  createMenuItem(menuItem: Partial<MenuItem>): Observable<MenuItem> {
    // Validate menu item data
    const validation = this.validateMenuItem(menuItem);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.message));
    }

    return this.crudService.postData(this.MENU_ENDPOINT, menuItem).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapMenuItemResponse(response.data);
        }
        throw new Error(response.message || 'Failed to create menu item');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update menu item
   */
  updateMenuItem(id: string, updates: Partial<MenuItem>): Observable<MenuItem> {
    // Validate updates
    const validation = this.validateMenuItem(updates, false);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.message));
    }

    return this.crudService.putData(this.MENU_ENDPOINT, updates, {}, id).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapMenuItemResponse(response.data);
        }
        throw new Error(response.message || 'Failed to update menu item');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete menu item
   */
  deleteMenuItem(id: string): Observable<boolean> {
    return this.crudService.deleteData(this.MENU_ENDPOINT, {}, id).pipe(
      map((response: any) => {
        if (response.success) {
          return true;
        }
        throw new Error(response.message || 'Failed to delete menu item');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update menu item availability
   */
  updateMenuItemAvailability(id: string, isAvailable: boolean): Observable<MenuItem> {
    return this.crudService.patchData(this.MENU_ENDPOINT, { isAvailable }, {}, id).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapMenuItemResponse(response.data);
        }
        throw new Error(response.message || 'Failed to update availability');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Bulk update menu items
   */
  bulkUpdateMenuItems(updates: { id: string; updates: Partial<MenuItem> }[]): Observable<MenuItem[]> {
    const items = updates.map(update => ({
      id: update.id,
      ...update.updates
    }));

    return this.crudService.bulkUpdate(this.MENU_ENDPOINT, items).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data.map((item: any) => this.mapMenuItemResponse(item));
        }
        throw new Error(response.message || 'Failed to bulk update menu items');
      }),
      catchError(this.handleError)
    );
  }

  // ===============================
  // MENU CATEGORY OPERATIONS
  // ===============================

  /**
   * Get all menu categories
   */
  getMenuCategories(): Observable<MenuCategory[]> {
    return this.crudService.getData(this.CATEGORY_ENDPOINT).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data.map((category: any) => this.mapCategoryResponse(category));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create menu category
   */
  createMenuCategory(category: Partial<MenuCategory>): Observable<MenuCategory> {
    const validation = this.validateMenuCategory(category);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.message));
    }

    return this.crudService.postData(this.CATEGORY_ENDPOINT, category).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapCategoryResponse(response.data);
        }
        throw new Error(response.message || 'Failed to create category');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update menu category
   */
  updateMenuCategory(id: string, updates: Partial<MenuCategory>): Observable<MenuCategory> {
    const validation = this.validateMenuCategory(updates, false);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.message));
    }

    return this.crudService.putData(this.CATEGORY_ENDPOINT, updates, {}, id).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapCategoryResponse(response.data);
        }
        throw new Error(response.message || 'Failed to update category');
      }),
      catchError(this.handleError)
    );
  }

  // ===============================
  // SEARCH AND FILTER OPERATIONS
  // ===============================

  /**
   * Search menu items
   */
  searchMenuItems(query: string, filters?: {
    category?: string;
    isAvailable?: boolean;
    isVegetarian?: boolean;
    isSpicy?: boolean;
  }): Observable<MenuItem[]> {
    const params = {
      search: query,
      ...filters
    };

    return this.crudService.getData(`${this.MENU_ENDPOINT}/search`, params).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data.map((item: any) => this.mapMenuItemResponse(item));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get popular menu items
   */
  getPopularMenuItems(limit: number = 10): Observable<MenuItem[]> {
    return this.crudService.getData(`${this.MENU_ENDPOINT}/popular`, { limit }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data.map((item: any) => this.mapMenuItemResponse(item));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // ===============================
  // VALIDATION METHODS
  // ===============================

  private validateMenuItem(item: Partial<MenuItem>, isCreate: boolean = true): { isValid: boolean; message?: string } {
    // Required fields for creation
    if (isCreate) {
      const nameValidation = this.validationService.menuName(item.name || '');
      if (!nameValidation.isValid) return nameValidation;

      const priceValidation = this.validationService.menuPrice(item.price || 0);
      if (!priceValidation.isValid) return priceValidation;

      const categoryValidation = this.validationService.menuCategory(item.category || '');
      if (!categoryValidation.isValid) return categoryValidation;
    }

    // Optional validations
    if (item.description) {
      const descValidation = this.validationService.menuDescription(item.description);
      if (!descValidation.isValid) return descValidation;
    }

    if (item.preparationTime) {
      const timeValidation = this.validationService.preparationTime(item.preparationTime);
      if (!timeValidation.isValid) return timeValidation;
    }

    return { isValid: true };
  }

  private validateMenuCategory(category: Partial<MenuCategory>, isCreate: boolean = true): { isValid: boolean; message?: string } {
    if (isCreate || category.name) {
      const nameValidation = this.validationService.name(category.name || '', 'Category name');
      if (!nameValidation.isValid) return nameValidation;
    }

    return { isValid: true };
  }

  // ===============================
  // RESPONSE MAPPING
  // ===============================

  private mapMenuItemResponse(data: any): MenuItem {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      category: data.category,
      image: data.image,
      isAvailable: data.isAvailable,
      isVegetarian: data.isVegetarian,
      isSpicy: data.isSpicy,
      preparationTime: data.preparationTime,
      allergens: data.allergens,
      customizations: data.customizations?.map((cust: any) => this.mapCustomizationResponse(cust)),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  private mapCustomizationResponse(data: any): MenuCustomization {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      required: data.required,
      options: data.options?.map((opt: any) => this.mapCustomizationOptionResponse(opt))
    };
  }

  private mapCustomizationOptionResponse(data: any): CustomizationOption {
    return {
      id: data.id,
      name: data.name,
      price: data.price
    };
  }

  private mapCategoryResponse(data: any): MenuCategory {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      displayOrder: data.displayOrder,
      isActive: data.isActive
    };
  }

  // ===============================
  // ERROR HANDLING
  // ===============================

  private handleError = (error: any): Observable<never> => {
    console.error('Menu API Error:', error);
    return throwError(() => error);
  };
}