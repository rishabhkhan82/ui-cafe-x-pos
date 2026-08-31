import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { CrudService } from '../../../services/crud.service';
import { SystemConfigService } from '../../../services/system-config.service';
import { MenuItem } from '../../../interfaces';
import { environment } from '../../../environments/environment';
import { Subject, Observable, Subscription, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { RealtimeService } from '../../../services/realtime.service';
import { MenuCategory, MenuItemsType } from '../../../interfaces';

interface MenuItemAddonLink {
  id: number;
  menu_item_id: number;
  addon_id: number;
  is_required: boolean;
  min_quantity: number;
  max_quantity: number;
  display_order: number;
  addon_name?: string;
  addon_price?: number;
  addon_image?: string;
}

@Component({
  selector: 'app-owner-menus-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-menus-mobile.component.html',
  styleUrl: './owner-menus-mobile.component.css'
})
export class OwnerMenusMobileComponent implements OnInit, OnDestroy {
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
  typeFilter = 'all';
  errorMessage = '';
  selectedFile: File | null = null;
  private subscriptions: Subscription[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 50;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50, 100];

  // Field validation errors
  fieldErrors: { [key: string]: string } = {};

  // Menu Categories
  categories: MenuCategory[] = [];

  // Menu Types
  typeOptions: MenuItemsType[] = [];

  // Menu Item Add-ons
  availableAddons: any[] = [];
  menuItemAddons: MenuItemAddonLink[] = [];

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
    category: '',
    image: environment.api.baseUrl + '/uploads/images/default/menu-default.png',
    item_id: '',
    discount: '',
    original_price: 0,
    half_price: 0,
    preparation_time: 0,
    is_active: true,
    is_available: true,
    is_popular: false,
    is_featured: false,
    is_recommended: false,
    is_spicy: false,
    is_veg: true,
    is_vegetarian: true,
    type: 'RAW',
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
    private validationService: ValidationService,
    private realtimeService: RealtimeService,
    private systemConfigService: SystemConfigService
  ) {}

  ngOnInit(): void {
    this.loadMenus();
    this.loadMenuCategories();
    this.loadMenuItemsTypes();
    this.setupSearch();

    const sub = this.realtimeService.menuUpdate$.subscribe((update: any) => {
      if (update) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && String(update.restaurantId) === String(currentUser.restaurantId)) {
          this.loadMenus();
        }
      }
    });
    this.subscriptions.push(sub);
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
        const apiMessage = error.error?.message || 'Failed to load menu items. Please try again.';
        this.errorMessage = error.error?.message || 'Failed to load menu items. Please try again.';
        this.loadingService.hide();
      }
    });
  }

  loadMenuCategories(): void {
    const currentUser = this.authService.getCurrentUser();
    const restaurantId = Number(currentUser?.restaurantId || currentUser?.restaurant_id || 0);

    this.crudService.getRestaurantMenuCategories({ restaurantId, isActive: true }).subscribe({
      next: (response: any) => {
        const categories = response.data || response || [];
        this.categories = categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          key: category.key,
          description: category.description,
          is_active: category.is_active ?? category.isActive ?? true,
          display_order: category.display_order ?? category.displayOrder ?? 0,
          created_by: category.created_by ?? category.createdBy ?? '',
          updated_by: category.updated_by ?? category.updatedBy ?? '',
          created_at: category.created_at ? new Date(category.created_at) : new Date(),
          updated_at: category.updated_at ? new Date(category.updated_at) : new Date()
        }));
      },
      error: (error) => {
        console.error('Error loading restaurant menu categories:', error);
      }
    });
  }

  loadMenuItemsTypes(): void {
    this.crudService.getMenuItemsTypes({ isActive: true }).subscribe({
      next: (response: any) => {
        const types = response.data || response || [];
        this.typeOptions = types.map((type: any) => ({
          id: type.id,
          name: type.name,
          key: type.key,
          description: type.description,
          is_active: type.is_active ?? type.isActive ?? true,
          display_order: type.display_order ?? type.displayOrder ?? 0,
          color_classes: type.color_classes ?? type.colorClasses ?? '',
          icon: type.icon ?? '',
          created_by: type.created_by ?? type.createdBy ?? '',
          updated_by: type.updated_by ?? type.updatedBy ?? '',
          created_at: type.created_at ? new Date(type.created_at) : new Date(),
          updated_at: type.updated_at ? new Date(type.updated_at) : new Date()
        }));
      },
      error: (error) => {
        console.error('Error loading menu item types:', error);
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
      const selectedCategory = this.categories.find(c => c.key === this.categoryFilter);
      params.category = selectedCategory ? selectedCategory.key : this.categoryFilter;
    }

    if (this.statusFilter !== 'all') {
      params.is_available = this.statusFilter === 'available';
    }

    if (this.typeFilter && this.typeFilter !== 'all') {
      params.type = this.typeFilter;
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
      half_price: apiMenuItem.half_price || 0,
      preparation_time: apiMenuItem.preparation_time || 0,
      is_active: apiMenuItem.is_active ?? true,
      is_available: apiMenuItem.is_available ?? true,
      is_popular: apiMenuItem.is_popular ?? false,
      is_featured: apiMenuItem.is_featured ?? false,
      is_recommended: apiMenuItem.is_recommended ?? false,
      is_spicy: apiMenuItem.is_spicy ?? false,
      is_veg: apiMenuItem.is_veg ?? true,
      is_vegetarian: apiMenuItem.is_vegetarian ?? true,
      type: apiMenuItem.type || 'RAW',
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
    this.typeFilter = 'all';
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

  editFromDetails(menu: MenuItem): void {
    this.selectedMenu = null;
    this.showMenuForm(menu);
  }

  showMenuForm(menu?: MenuItem): void {
    this.showAddForm = true;
    this.editingMenu = menu || null;
    this.availableAddons = [];
    this.menuItemAddons = [];
    if (menu) {
      this.menuForm = { ...menu };
      this.loadMenuItemAddons(menu.id);
    } else {
      this.menuForm = {
        id: Date.now(),
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '/uploads/images/default/menu-default.png',
        item_id: '',
        discount: '',
        original_price: 0,
        half_price: 0,
        preparation_time: 0,
        is_active: true,
        is_available: true,
        is_popular: false,
        is_featured: false,
        is_recommended: false,
        is_spicy: false,
        is_veg: true,
        is_vegetarian: true,
        type: 'RAW',
        restaurant_id: 1,
        created_at: undefined,
        updated_at: undefined,
        created_by: undefined,
        updated_by: undefined
      };
    }
    this.loadAvailableAddons();
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.menuForm = {
      id: 0,
      name: '',
      description: '',
      price: 0,
      category: '',
      image: environment.api.baseUrl + '/uploads/images/default/menu-default.png',
      item_id: '',
      discount: '',
      original_price: 0,
      half_price: 0,
      preparation_time: 0,
      is_active: true,
      is_available: true,
      is_popular: false,
      is_featured: false,
      is_recommended: false,
      is_spicy: false,
      is_veg: true,
      is_vegetarian: true,
      type: 'RAW',
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
    this.availableAddons = [];
    this.menuItemAddons = [];
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
    this.validateOriginalPrice();
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

  recalculateDiscount(): void {
    const original = Number(this.menuForm.original_price);
    const current = Number(this.menuForm.price);
    if (original > 0 && current > 0 && current < original) {
      const discountPercent = Math.round(((original - current) / original) * 100);
      this.menuForm.discount = discountPercent + '% off';
    }
  }

  recalculatePriceFromDiscount(): void {
    const original = Number(this.menuForm.original_price);
    if (original <= 0) return;
    const match = String(this.menuForm.discount).match(/(\d+)/);
    if (match) {
      const percent = parseInt(match[1], 10);
      this.menuForm.price = Math.round((original * (1 - percent / 100)) * 100) / 100;
    } else {
      this.menuForm.price = original;
    }
  }

  generateItemId(): void {
    if (this.menuForm.name && this.menuForm.name.trim()) {
      this.menuForm.item_id = this.menuForm.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '_');
    } else {
      this.menuForm.item_id = '';
    }
  }

  validateCategory(): void {
    const validation = this.validationService.required(this.menuForm.category, 'Category');
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

  validateOriginalPrice(): void {
    const value = Number(this.menuForm.original_price);
    if (isNaN(value) || value <= 0) {
      this.fieldErrors['original_price'] = 'Original Price is required';
    } else {
      delete this.fieldErrors['original_price'];
    }
  }

  validateImage(): void {
    const defaultImage = environment.api.baseUrl + '/uploads/images/default/menu-default.png';
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
          half_price: this.menuForm.half_price,
          preparation_time: this.menuForm.preparation_time,
          is_active: this.menuForm.is_active,
          is_available: this.menuForm.is_available,
          is_popular: this.menuForm.is_popular,
          is_featured: this.menuForm.is_featured,
          is_recommended: this.menuForm.is_recommended,
           is_spicy: this.menuForm.is_spicy,
           is_veg: this.menuForm.is_veg,
           is_vegetarian: this.menuForm.is_vegetarian,
           type: this.menuForm.type || 'RAW',
           restaurant_id: currentUser?.restaurantId || 1,
           created_at: currentTime.toISOString(),
           updated_at: currentTime.toISOString(),
           created_by: Number(currentUser?.id) || 1,
           updated_by: Number(currentUser?.id) || 1
        };

        // Create new menu item
        this.crudService.createMenuItem(menuRequest).pipe(
          switchMap((response: any) => {
            console.log('Menu item created successfully:', response);
            this.notificationService.success('Menu Item Created', 'The menu item has been successfully created.');
            return this.saveAddonLinks(response.id).pipe(
              catchError((linkError) => {
                console.error('Error saving add-on links after menu creation:', linkError);
                return of(null);
              })
            );
          }),
          catchError((error) => {
            console.error('Error creating menu item:', error);
            const apiMessage = error.error?.message || 'Failed to create menu item. Please try again.';
            this.errorMessage = apiMessage;
            this.loadingService.hide();

            const apiFieldErrors = error.error?.fieldErrors as Record<string, string[]> | undefined;
            if (apiFieldErrors) {
              Object.entries(apiFieldErrors).forEach(([field, messages]) => {
                if (messages && messages.length > 0) {
                  this.fieldErrors[field] = messages[0];
                }
              });
            }

            this.notificationService.error('Creation Failed', apiMessage);
            return [];
          })
        ).subscribe({
          next: () => {
            this.cancelAdd();
            this.loadMenus();
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
        half_price: this.menuForm.half_price,
        preparation_time: this.menuForm.preparation_time,
        is_active: this.menuForm.is_active,
        is_available: this.menuForm.is_available,
        is_popular: this.menuForm.is_popular,
        is_featured: this.menuForm.is_featured,
        is_recommended: this.menuForm.is_recommended,
         is_spicy: this.menuForm.is_spicy,
         is_veg: this.menuForm.is_veg,
         is_vegetarian: this.menuForm.is_vegetarian,
         type: this.menuForm.type || 'RAW',
         restaurant_id: this.menuForm.restaurant_id,
         created_at: this.editingMenu!.created_at?.toISOString() || currentTime.toISOString(),
         updated_at: currentTime.toISOString(),
         created_by: this.editingMenu!.created_by,
         updated_by: Number(currentUser?.id) || 1
       };

       console.log('Updating menu item, menuRequest:', menuRequest);

        // Update existing menu item
        this.crudService.updateMenuItem(this.editingMenu!.id, menuRequest).pipe(
          switchMap((response: any) => {
            console.log('Menu item updated successfully:', response);
            this.notificationService.success('Menu Item Updated', 'The menu item has been successfully updated.');
            return this.saveAddonLinks(this.editingMenu!.id).pipe(
              catchError((linkError) => {
                console.error('Error saving add-on links after menu update:', linkError);
                return of(null);
              })
            );
          }),
          catchError((error) => {
            console.error('Error updating menu item:', error);
            const apiMessage = error.error?.message || 'Failed to update menu item. Please try again.';
            this.errorMessage = apiMessage;
            this.loadingService.hide();

            const apiFieldErrors = error.error?.fieldErrors as Record<string, string[]> | undefined;
            if (apiFieldErrors) {
              Object.entries(apiFieldErrors).forEach(([field, messages]) => {
                if (messages && messages.length > 0) {
                  this.fieldErrors[field] = messages[0];
                }
              });
            }

            this.notificationService.error('Update Failed', apiMessage);
            return [];
          })
        ).subscribe({
          next: () => {
            this.cancelAdd();
            this.loadMenus();
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
          const apiMessage = error.error?.message || 'Failed to delete menu item. Please try again.';
          this.errorMessage = apiMessage;
          this.loadingService.hide();
        }
      });
    }
  }

  loadAvailableAddons(): void {
    const currentUser = this.authService.getCurrentUser();
    const params: any = {
      restaurant_id: currentUser?.restaurantId,
      is_active: true,
      page: 1,
      size: 100
    };

    this.crudService.getData('menu-addons', params).subscribe({
      next: (response: any) => {
        const data = response.data || response || [];
        this.availableAddons = data.map((addon: any) => ({
          id: addon.id,
          name: addon.name,
          description: addon.description,
          price: addon.price,
          image: addon.image,
          is_active: addon.is_active,
          display_order: addon.display_order
        }));
      },
      error: (error) => {
        console.error('Error loading available add-ons:', error);
      }
    });
  }

  loadMenuItemAddons(menuItemId: number): void {
    this.crudService.getData(`menu-item-addons/menu-item/${menuItemId}`).subscribe({
      next: (response: any) => {
        const data = response || [];
        this.menuItemAddons = data.map((item: any) => ({
          id: item.id,
          menu_item_id: item.menu_item_id,
          addon_id: item.addon_id,
          is_required: item.is_required,
          min_quantity: item.min_quantity,
          max_quantity: item.max_quantity,
          display_order: item.display_order,
          addon_name: item.addon_name,
          addon_price: item.addon_price,
          addon_image: item.addon_image
        }));
      },
      error: (error) => {
        console.error('Error loading menu item add-ons:', error);
      }
    });
  }

  isAddonSelected(addonId: number): boolean {
    return this.menuItemAddons.some(link => link.addon_id === addonId);
  }

  getAddonLink(addonId: number): MenuItemAddonLink | undefined {
    return this.menuItemAddons.find(link => link.addon_id === addonId);
  }

  toggleAddon(addon: any): void {
    const existingIndex = this.menuItemAddons.findIndex(link => link.addon_id === addon.id);
    if (existingIndex >= 0) {
      this.menuItemAddons.splice(existingIndex, 1);
    } else {
      this.menuItemAddons.push({
        id: 0,
        menu_item_id: this.editingMenu ? this.editingMenu.id : this.menuForm.id as number,
        addon_id: addon.id,
        is_required: false,
        min_quantity: 0,
        max_quantity: 10,
        display_order: this.menuItemAddons.length,
        addon_name: addon.name,
        addon_price: addon.price,
        addon_image: addon.image
      });
    }
  }

  updateAddonConfig(addonId: number, field: string, value: any): void {
    const link = this.menuItemAddons.find(l => l.addon_id === addonId);
    if (link) {
      (link as any)[field] = value;
    }
  }

  removeAddonLink(linkId: number): void {
    this.menuItemAddons = this.menuItemAddons.filter(link => link.id !== linkId);
  }

  saveAddonLinks(menuItemId: number): Observable<any> {
    const currentUser = this.authService.getCurrentUser();

    return this.crudService.deleteData('menu-item-addons/menu-item/' + menuItemId).pipe(
      switchMap(() => {
        if (this.menuItemAddons.length === 0) {
          return of(null);
        }

        const linksToSave = this.menuItemAddons.map(link => ({
          addon_id: link.addon_id,
          is_required: link.is_required,
          min_quantity: link.min_quantity,
          max_quantity: link.max_quantity,
          display_order: link.display_order,
          updated_by: Number(currentUser?.id) || 1
        }));

        const postObservables = linksToSave.map(linkData => {
          const payload = {
            addon_id: linkData.addon_id,
            is_required: linkData.is_required,
            min_quantity: linkData.min_quantity,
            max_quantity: linkData.max_quantity,
            display_order: linkData.display_order,
            updated_by: linkData.updated_by
          };
          return this.crudService.postData(`menu-item-addons/menu-item/${menuItemId}/addons`, payload);
        });

        return forkJoin(postObservables);
      }),
      catchError(error => {
        console.error('Error saving add-on links:', error);
        return of(null);
      })
    );
  }

  // Helper for template Math operations
  Math = Math;

  trackByAddonId(index: number, addon: any): number {
    return addon.id;
  }

  getCheckboxChecked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  getInputNumber(event: Event): number {
    return +((event.target as HTMLInputElement).value);
  }

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() ||
              this.categoryFilter !== 'all' ||
              this.statusFilter !== 'all' ||
              this.typeFilter !== 'all');
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

  get fileUploadMaxSizeMB(): number {
    return this.systemConfigService.fileUploadMaxSizeMB;
  }

  // Helper method to validate file
  private validateFile(file: File, category: string): { isValid: boolean; message?: string } {
    const maxFileSizeMB = this.systemConfigService.fileUploadMaxSizeMB;
    const maxFileSize = maxFileSizeMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        message: `File size exceeds maximum allowed size of ${maxFileSizeMB}MB`
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
