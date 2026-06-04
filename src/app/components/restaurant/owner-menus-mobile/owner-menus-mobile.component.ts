import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { CrudService } from '../../../services/crud.service';
import { MenuItem } from '../../../interfaces';
import { environment } from '../../../environments/environment';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-owner-menus-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-menus-mobile.component.html',
  styleUrl: './owner-menus-mobile.component.css'
})
export class OwnerMenusMobileComponent implements OnInit {
  menus: MenuItem[] = [];
  selectedMenu: MenuItem | null = null;
  editingMenu: MenuItem | null = null;
  searchTerm = '';
  categoryFilter = 'all';
  statusFilter = 'all';
  showAddForm = false;
  showSearchBar = false;
  searchInput = '';
  searchSubject = new Subject<string>();
  errorMessage = '';
  selectedFile: File | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  // Field validation errors
  fieldErrors: { [key: string]: string } = {};

  // Menu Categories
  categories = [
    {code : 'all', label: 'All'},
    {code : 'starters', label: 'Starters'},
    {code : 'main-course', label: 'Main Course'},
    {code : 'salads', label: 'Salads'},
    {code : 'desserts', label: 'Desserts'},
    {code : 'beverages', label: 'Beverages'},
    {code : 'snacks', label: 'Snacks'}
  ];

  // Category color mapping to avoid function calls in templates
  categoryColorMap: { [key: string]: string } = {
    'Starters': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Main Course': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Salads': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Desserts': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Beverages': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Snacks': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
  };

  menuForm: MenuItem = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
    item_id: '',
    discount: '',
    original_price: 0,
    preparation_time: 0,
    is_active: true,
    is_available: true,
    is_popular: false,
    is_spicy: false,
    is_veg: true,
    is_vegetarian: true,
    restaurant_id: 1,
    created_at: undefined,
    updated_at: undefined,
    created_by: undefined,
    updated_by: undefined
  };

  constructor(
    public router: Router,
    public loadingService: LoadingService,
    private confirmationService: ConfirmationDialogService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private crudService: CrudService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.loadMenus();
    this.setupSearch();
  }

  loadMenus(): void {
    this.loadingService.show();
    this.errorMessage = '';

    this.getMenusObservable(this.buildParams()).subscribe({
      next: (response: any) => {
        this.menus = this.mapApiMenuItemsToMenuItems(response.data);
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.errorMessage = 'Failed to load menu items. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  private getMenusObservable(params: any): Observable<any> {
    return this.crudService.getMenuItems(params);
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

    if (this.categoryFilter && this.categoryFilter !== 'all') {
      const selectedCategory = this.categories.find(c => c.code === this.categoryFilter);
      params.category = selectedCategory ? selectedCategory.label : this.categoryFilter;
    }

    if (this.statusFilter !== 'all') {
      params.is_available = this.statusFilter === 'available';
    }

    console.log(params);
    return params;
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        return this.getMenusObservable(this.buildParams());
      })
    ).subscribe({
      next: (response: any) => {
        this.menus = this.mapApiMenuItemsToMenuItems(response.data);
        this.totalPages = response.pageCount;
        this.totalElements = response.totalRowCount;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error searching menu items:', error);
        this.loadingService.hide();
      }
    });
  }

  private mapApiMenuItemsToMenuItems(apiMenuItems: any[]): MenuItem[] {
    return apiMenuItems.map(apiMenuItem => ({
      id: apiMenuItem.id,
      name: apiMenuItem.name || '',
      description: apiMenuItem.description || '',
      price: apiMenuItem.price || 0,
      category: apiMenuItem.category || '',
      image: apiMenuItem.image || '',
      item_id: apiMenuItem.item_id || '',
      discount: apiMenuItem.discount || '',
      original_price: apiMenuItem.original_price || apiMenuItem.price || 0,
      preparation_time: apiMenuItem.preparation_time || 0,
      is_active: apiMenuItem.is_active ?? true,
      is_available: apiMenuItem.is_available ?? true,
      is_popular: apiMenuItem.is_popular ?? false,
      is_spicy: apiMenuItem.is_spicy ?? false,
      is_veg: apiMenuItem.is_veg ?? true,
      is_vegetarian: apiMenuItem.is_vegetarian ?? true,
      restaurant_id: apiMenuItem.restaurant_id || 1,
      created_at: apiMenuItem.created_at ? new Date(apiMenuItem.created_at) : undefined,
      updated_at: apiMenuItem.updated_at ? new Date(apiMenuItem.updated_at) : undefined,
      created_by: apiMenuItem.created_by,
      updated_by: apiMenuItem.updated_by
    }));
  }

  filterMenus(): void {
    this.currentPage = 1; // Reset to first page when filters change
    this.loadMenus();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = 'all';
    this.statusFilter = 'all';
    this.currentPage = 1; // Reset to first page
    this.loadMenus();
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
      this.loadMenus();
    }
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.loadMenus();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectMenu(menu: MenuItem): void {
    this.selectedMenu = menu;
  }

  showMenuForm(menu?: MenuItem): void {
    this.showAddForm = true;
    this.editingMenu = menu || null;
    if (menu) {
      this.menuForm = { ...menu };
    } else {
      this.menuForm = {
        id: Date.now(),
        name: '',
        description: '',
        price: 0,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        item_id: '',
        discount: '',
        original_price: 0,
        preparation_time: 0,
        is_active: true,
        is_available: true,
        is_popular: false,
        is_spicy: false,
        is_veg: true,
        is_vegetarian: true,
        restaurant_id: 1,
        created_at: undefined,
        updated_at: undefined,
        created_by: undefined,
        updated_by: undefined
      };
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.menuForm = {
      id: 0,
      name: '',
      description: '',
      price: 0,
      category: 'Starters',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      item_id: '',
      discount: '',
      original_price: 0,
      preparation_time: 0,
      is_active: true,
      is_available: true,
      is_popular: false,
      is_spicy: false,
      is_veg: true,
      is_vegetarian: true,
      restaurant_id: 1,
      created_at: undefined,
      updated_at: undefined,
      created_by: undefined,
      updated_by: undefined
    };
    this.editingMenu = null;
    this.selectedFile = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      const validation = this.validateFile(file, 'menu_image');
      if (!validation.isValid) {
        this.notificationService.error('Invalid File', validation.message || 'Invalid file selected');
        this.selectedFile = null;
        this.menuForm.image = "";
        return;
      }

      // Clear any previous error
      this.errorMessage = '';

      // Store the file for later upload
      this.selectedFile = file;

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.menuForm.image = e.target?.result as string;
        this.validateImage();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmitForm(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    this.validateName();
    this.validateDescription();
    this.validatePrice();
    this.validateCategory();
    this.validateItemId();
    this.validatePreparationTime();
    this.validateImage();

    if (Object.keys(this.fieldErrors).length > 0) {
      return;
    }

    if (this.editingMenu) {
      this.updateMenu();
    } else {
      this.createMenu();
    }
  }

  validateName(): void {
    const validation = this.validationService.menuName(this.menuForm.name);
    if (!validation.isValid) {
      this.fieldErrors['name'] = validation.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateDescription(): void {
    const validation = this.validationService.menuDescription(this.menuForm.description);
    if (!validation.isValid) {
      this.fieldErrors['description'] = validation.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  validatePrice(): void {
    const validation = this.validationService.menuPrice(this.menuForm.price);
    if (!validation.isValid) {
      this.fieldErrors['price'] = validation.message!;
    } else {
      delete this.fieldErrors['price'];
    }
  }

  validateCategory(): void {
    const validation = this.validationService.menuCategory(this.menuForm.category);
    if (!validation.isValid) {
      this.fieldErrors['category'] = validation.message!;
    } else {
      delete this.fieldErrors['category'];
    }
  }

  validateItemId(): void {
    const validation = this.validationService.required(this.menuForm.item_id, 'Item ID');
    if (!validation.isValid) {
      this.fieldErrors['item_id'] = validation.message!;
    } else {
      delete this.fieldErrors['item_id'];
    }
  }

  validatePreparationTime(): void {
    const validation = this.validationService.preparationTime(this.menuForm.preparation_time);
    if (!validation.isValid) {
      this.fieldErrors['preparation_time'] = validation.message!;
    } else {
      delete this.fieldErrors['preparation_time'];
    }
  }

  validateImage(): void {
    const defaultImage = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop';
    if (!this.menuForm.image || this.menuForm.image === defaultImage) {
      this.fieldErrors['image'] = 'Image is required';
    } else {
      delete this.fieldErrors['image'];
    }
  }

  async createMenu(): Promise<void> {
    this.loadingService.show();

    try {
      let imageBase64: string | undefined;

      // Convert selected file to base64 if provided
      if (this.selectedFile) {
        imageBase64 = await this.fileToBase64(this.selectedFile);
        this.selectedFile = null; // Clear the selected file
      }

      const currentTime = new Date();
      const currentUser = this.authService.getCurrentUser();
      const menuRequest = {
        name: this.menuForm.name,
        description: this.menuForm.description,
        price: this.menuForm.price,
        category: this.menuForm.category,
        image: imageBase64 || this.menuForm.image, // Use base64 if available, else keep existing
        item_id: this.menuForm.item_id,
        discount: this.menuForm.discount,
        original_price: this.menuForm.original_price,
        preparation_time: this.menuForm.preparation_time,
        is_active: this.menuForm.is_active,
        is_available: this.menuForm.is_available,
        is_popular: this.menuForm.is_popular,
        is_spicy: this.menuForm.is_spicy,
        is_veg: this.menuForm.is_veg,
        is_vegetarian: this.menuForm.is_vegetarian,
        restaurant_id: currentUser?.restaurantId || 1,
        created_at: currentTime.toISOString(),
        updated_at: currentTime.toISOString(),
        created_by: Number(currentUser?.id) || 1,
        updated_by: Number(currentUser?.id) || 1
      };

      // Create new menu item
      this.crudService.createMenuItem(menuRequest).subscribe({
        next: (response) => {
          console.log('Menu item created successfully:', response);
          this.notificationService.success('Menu Item Created', 'The menu item has been successfully created.');
          this.cancelAdd();
          this.loadMenus(); // Reload menu items
        },
        error: (error) => {
          console.error('Error creating menu item:', error);
          this.notificationService.error('Creation Failed', 'Failed to create menu item. Please try again.');
          this.errorMessage = 'Failed to create menu item. Please try again.';
          this.loadingService.hide();
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      this.notificationService.error('Processing Failed', 'Failed to process image. Please try again.');
      this.errorMessage = 'Failed to process image. Please try again.';
      this.loadingService.hide();
    }
  }

  async updateMenu(): Promise<void> {
    this.loadingService.show();

    try {
      let imageBase64: string | undefined;

      // Convert selected file to base64 if provided
      if (this.selectedFile) {
        imageBase64 = await this.fileToBase64(this.selectedFile);
        this.selectedFile = null; // Clear the selected file
      }

      const currentTime = new Date();
      const currentUser = this.authService.getCurrentUser();
      const menuRequest = {
        name: this.menuForm.name,
        description: this.menuForm.description,
        price: this.menuForm.price,
        category: this.menuForm.category,
        image: imageBase64 || this.menuForm.image, // Use base64 if available, else keep existing
        item_id: this.menuForm.item_id,
        discount: this.menuForm.discount,
        original_price: this.menuForm.original_price,
        preparation_time: this.menuForm.preparation_time,
        is_active: this.menuForm.is_active,
        is_available: this.menuForm.is_available,
        is_popular: this.menuForm.is_popular,
        is_spicy: this.menuForm.is_spicy,
        is_veg: this.menuForm.is_veg,
        is_vegetarian: this.menuForm.is_vegetarian,
        restaurant_id: this.menuForm.restaurant_id,
        created_at: this.editingMenu!.created_at?.toISOString() || currentTime.toISOString(),
        updated_at: currentTime.toISOString(),
        created_by: this.editingMenu!.created_by,
        updated_by: Number(currentUser?.id) || 1
      };

      console.log('Updating menu item, menuRequest:', menuRequest);

      // Update existing menu item
      this.crudService.updateMenuItem(this.editingMenu!.id, menuRequest).subscribe({
        next: (response) => {
          console.log('Menu item updated successfully:', response);
          this.notificationService.success('Menu Item Updated', 'The menu item has been successfully updated.');
          this.cancelAdd();
          this.loadMenus(); // Reload menu items
        },
        error: (error) => {
          console.error('Error updating menu item:', error);
          this.notificationService.error('Update Failed', 'Failed to update menu item. Please try again.');
          this.errorMessage = 'Failed to update menu item. Please try again.';
          this.loadingService.hide();
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      this.notificationService.error('Processing Failed', 'Failed to process image. Please try again.');
      this.errorMessage = 'Failed to process image. Please try again.';
      this.loadingService.hide();
    }
  }

  async deleteMenu(menu: MenuItem): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to delete "${menu.name}"? This action cannot be undone.`,
      'Delete Menu Item',
      'Delete',
      'Cancel'
    );

    if (confirmed) {
      this.loadingService.show();
      this.errorMessage = '';

      this.crudService.deleteMenuItem(menu.id).subscribe({
        next: () => {
          console.log('Menu item deleted successfully:', menu.id);
          if (this.selectedMenu?.id === menu.id) {
            this.selectedMenu = null;
          }
          this.loadMenus(); // Reload menu items from server to get updated pagination
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error deleting menu item:', error);
          this.errorMessage = 'Failed to delete menu item. Please try again.';
          this.loadingService.hide();
        }
      });
    }
  }



  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() ||
              this.categoryFilter !== 'all' ||
              this.statusFilter !== 'all');
  }

  // Calculate pagination range to avoid Math.min in template
  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    return `${start}-${end}`;
  }

  // Helper method to convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Helper method to get full image URL
  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) {
      // It's a base64 data URL, return as is
      return imagePath;
    }
    // It's a relative path, concat with baseImgUrl
    return environment.api.baseUrl + imagePath;
  }

  // Helper method to validate file
  private validateFile(file: File, category: string): { isValid: boolean; message?: string } {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        message: `File size exceeds maximum allowed size of 5MB`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: `File type ${file.type} is not allowed. Allowed types: JPEG, PNG, WebP`
      };
    }

    return { isValid: true };
  }
}
