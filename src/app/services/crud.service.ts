import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudParams, CrudHeaders, NewLoyaltyProgram } from './mock-data.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private http: HttpClient) { }

  // ===============================
  // GET OPERATIONS
  // ===============================

  getData(apiName: string, params?: CrudParams, headers?: CrudHeaders): Observable<any> {
    const url = this.buildUrl(apiName);
    const httpParams = this.buildParams(params);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.get(url, { headers: httpHeaders, params: httpParams });
  }

  getOrdersForReports(startDate: string, endDate: string, status: string = 'COMPLETED', restaurantId?: string | number): Observable<any> {
    const params: any = {
      startDate: startDate,
      endDate: endDate,
      status: status
    };
    if (restaurantId !== undefined && restaurantId !== null && restaurantId !== '') {
      params['restaurant_id'] = restaurantId;
    }
    const url = this.buildUrl('orders/reports');
    const httpParams = this.buildParams(params);
    const httpHeaders = this.buildHeaders({});

    return this.http.get(url, { headers: httpHeaders, params: httpParams });
  }

  getRestaurantReport(reportType: string, startDate: string, endDate: string, restaurantId: string | number): Observable<any> {
    const params: any = {
      reportType: reportType,
      startDate: startDate,
      endDate: endDate,
      restaurantId: restaurantId
    };
    const url = this.buildUrl('restaurant-report');
    const httpParams = this.buildParams(params);
    const httpHeaders = this.buildHeaders({});

    return this.http.get(url, { headers: httpHeaders, params: httpParams });
  }

  getRestaurantReportPdf(reportType: string, startDate: string, endDate: string, restaurantId: string | number): Observable<Blob> {
    const params: any = {
      reportType: reportType,
      startDate: startDate,
      endDate: endDate,
      restaurantId: restaurantId
    };
    const url = this.buildUrl('restaurant-report/pdf');
    const httpParams = this.buildParams(params);
    let headers = this.buildHeaders({});
    headers = headers.set('Accept', 'application/pdf');

    return this.http.get(url, { headers: headers, params: httpParams, responseType: 'blob' });
  }

  // ===============================
  // POST OPERATIONS
  // ===============================

  postData(apiName: string, payload: any, headers?: CrudHeaders): Observable<any> {
    const url = this.buildUrl(apiName);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.post(url, payload, { headers: httpHeaders });
  }

  // ===============================
  // PUT OPERATIONS
  // ===============================

  putData(apiName: string, payload: any, headers?: CrudHeaders, id?: string | number): Observable<any> {
    const url = this.buildUrl(apiName, id);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.put(url, payload, { headers: httpHeaders });
  }

  // ===============================
  // PATCH OPERATIONS
  // ===============================

  patchData(apiName: string, payload: any, headers?: CrudHeaders, id?: string | number): Observable<any> {
    const url = this.buildUrl(apiName, id);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.patch(url, payload, { headers: httpHeaders });
  }

  // ===============================
  // DELETE OPERATIONS
  // ===============================

  deleteData(apiName: string, headers?: CrudHeaders, id?: string | number): Observable<any> {
    const url = this.buildUrl(apiName, id);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.delete(url, { headers: httpHeaders });
  }

  // ===============================
  // FILE UPLOAD OPERATIONS
  // ===============================

  uploadFile(apiName: string, file: File, additionalData?: any, headers?: CrudHeaders): Observable<any> {
    const url = this.buildUrl(apiName);
    const formData = new FormData();

    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const httpHeaders = this.buildHeaders(headers, true); // true for file upload

    return this.http.post(url, formData, { headers: httpHeaders });
  }

  // ===============================
  // BULK OPERATIONS
  // ===============================

  bulkCreate(apiName: string, items: any[], headers?: CrudHeaders): Observable<any> {
    const url = this.buildUrl(`${apiName}/bulk`);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.post(url, { items }, { headers: httpHeaders });
  }

  bulkUpdate(apiName: string, items: any[], headers?: CrudHeaders): Observable<any> {
    const url = this.buildUrl(`${apiName}/bulk`);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.put(url, { items }, { headers: httpHeaders });
  }

  bulkDelete(apiName: string, ids: (string | number)[], headers?: CrudHeaders): Observable<any> {
    const url = this.buildUrl(`${apiName}/bulk`);
    const httpHeaders = this.buildHeaders(headers);

    return this.http.request('delete', url, {
      headers: httpHeaders,
      body: { ids }
    });
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private buildUrl(apiName: string, id?: string | number): string {
    let url = `${environment.api.baseUrl}/${apiName}`;

    if (id !== undefined) {
      url += `/${id}`;
    }

    return url;
  }

  private buildParams(params?: CrudParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }

  private buildHeaders(headers?: CrudHeaders, isFileUpload: boolean = false): HttpHeaders {
    let httpHeaders = new HttpHeaders();

    // Default headers
    if (!isFileUpload) {
      httpHeaders = httpHeaders.set('Content-Type', 'application/json');
    }

    // Add Authorization header if token exists
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      httpHeaders = httpHeaders.set('Authorization', `Bearer ${token}`);
    }

    // Custom headers
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return httpHeaders;
  }

  // ===============================
  // CONVENIENCE METHODS FOR COMMON OPERATIONS
  // ===============================

  // Menu Item operations
  getMenuItems(params?: CrudParams): Observable<any> {
    return this.getData('menu-items', params);
  }

  getMenuItemById(id: string | number): Observable<any> {
    return this.getData(`menu-items/${id}`);
  }

  createMenuItem(payload: any): Observable<any> {
    return this.postData('menu-items', payload);
  }

  updateMenuItem(id: string | number, payload: any): Observable<any> {
    return this.putData('menu-items', payload, {}, id);
  }

  deleteMenuItem(id: string | number): Observable<any> {
    return this.deleteData('menu-items', {}, id);
  }

  // Inventory Item operations
  getInventoryItems(params?: any): Observable<any> {
    return this.getData('inventory-items', params);
  }

  getInventoryItemById(id: string | number): Observable<any> {
    return this.getData(`inventory-items/${id}`);
  }

  createInventoryItem(payload: any): Observable<any> {
    return this.postData('inventory-items', payload);
  }

  updateInventoryItem(id: string | number, payload: any): Observable<any> {
    return this.putData('inventory-items', payload, {}, id);
  }

  deleteInventoryItem(id: string | number): Observable<any> {
    return this.deleteData('inventory-items', {}, id);
  }

  // Recipe CRUD operations
  createRecipe(payload: any): Observable<any> {
    return this.postData('recipes', payload);
  }

  updateRecipe(id: string | number, payload: any): Observable<any> {
    return this.putData('recipes', payload, {}, id);
  }

  getRecipes(params?: any): Observable<any> {
    return this.getData('recipes', params);
  }

  getRecipeById(id: string | number): Observable<any> {
    return this.getData(`recipes/${id}`);
  }

  deleteRecipe(id: string | number): Observable<any> {
    return this.deleteData('recipes', {}, id);
  }

  // Recipe / Production operations
  produceRecipe(payload: any): Observable<any> {
    return this.postData('recipes/produce', payload);
  }

  getRecipeProductions(params?: any): Observable<any> {
    return this.getData('recipes/productions', params);
  }

  // Inventory Stock Log operations
  getStockLogs(params?: any): Observable<any> {
    return this.getData('inventory-stock-logs', params);
  }

  getStockLogSummary(params?: any): Observable<any> {
    return this.getData('inventory-stock-logs/summary', params);
  }

  // Waste Management operations
  createWasteBatch(payload: any): Observable<any> {
    return this.postData('waste-management/batch', payload);
  }

  getWasteManagement(params?: any): Observable<any> {
    return this.getData('waste-management', params);
  }

  deleteWasteManagement(id: string | number): Observable<any> {
    return this.deleteData('waste-management', {}, id);
  }

  // Offer operations
  getOffers(params?: CrudParams): Observable<any> {
    return this.getData('offers', params);
  }

  getOfferById(id: string | number): Observable<any> {
    return this.getData(`offers/${id}`);
  }

  createOffer(payload: any): Observable<any> {
    return this.postData('offers', payload);
  }

  updateOffer(id: string | number, payload: any): Observable<any> {
    return this.putData('offers', payload, {}, id);
  }

  deleteOffer(id: string | number): Observable<any> {
    return this.deleteData('offers', {}, id);
  }

  // Order operations
  getOrders(params?: CrudParams): Observable<any> {
    return this.getData('orders', params);
  }

  getCurrentOrders(restaurantId?: string | number): Observable<any> {
    const params: any = {};
    if (restaurantId !== undefined && restaurantId !== null && restaurantId !== '') {
      params['restaurant_id'] = restaurantId;
    }
    return this.getData('current-orders', params);
  }

  getOrderById(id: string | number): Observable<any> {
    return this.getData(`orders/${id}`);
  }

  createOrder(payload: any): Observable<any> {
    return this.postData('orders', payload);
  }

  updateOrder(id: string | number, payload: any): Observable<any> {
    return this.putData('orders', payload, {}, id);
  }

  deleteOrder(id: string | number): Observable<any> {
    return this.deleteData('orders', {}, id);
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.patchData('orders', { status }, {}, id);
  }

  getActiveOrders(customerId?: number | string): Observable<any> {
    return this.getData('orders/customer/active', customerId ? { customerId } : undefined);
  }

  // Order Item operations
  getOrderItems(params?: CrudParams): Observable<any> {
    return this.getData('order-items', params);
  }

  getOrderItemById(id: string | number): Observable<any> {
    return this.getData(`order-items/${id}`);
  }

  createOrderItem(payload: any): Observable<any> {
    return this.postData('order-items', payload);
  }

  updateOrderItem(id: string | number, payload: any): Observable<any> {
    return this.putData('order-items', payload, {}, id);
  }

  deleteOrderItem(id: string | number): Observable<any> {
    return this.deleteData('order-items', {}, id);
  }

  // Inventory operations
  getInventory(params?: CrudParams): Observable<any> {
    return this.getData('inventory', params);
  }

  updateStock(id: string, quantity: number): Observable<any> {
    return this.patchData('inventory', { quantity }, {}, id);
  }

  // User operations
  getUsers(params?: CrudParams): Observable<any> {
    return this.getData('users', params);
  }

  getUserById(id: number): Observable<any> {
    return this.getData(`users/${id}`);
  }

  createUser(payload: any): Observable<any> {
    return this.postData('users', payload);
  }

  updateUser(id: string | number, payload: any): Observable<any> {
    return this.putData('users', payload, {}, id);
  }

  deleteUser(id: string | number): Observable<any> {
    return this.deleteData('users', {}, id);
  }

  // Restaurant operations
  getRestaurants(params?: CrudParams): Observable<any> {
    return this.getData('restaurants', params);
  }

  createRestaurant(payload: any): Observable<any> {
    return this.postData('restaurants', payload);
  }

  updateRestaurant(id: string | number, payload: any): Observable<any> {
    return this.putData('restaurants', payload, {}, id);
  }

  updateRestaurantSubscriptionDetails(id: string | number, payload: any): Observable<any> {
    return this.putData(`restaurants/${id}/subscription-details`, payload);
  }

  deleteRestaurant(id: string | number): Observable<any> {
    return this.deleteData('restaurants', {}, id);
  }

  getRestaurantById(id: string | number): Observable<any> {
    return this.getData(`restaurants/${id}`);
  }

  // User role operations
  getUserRoles(params?: CrudParams): Observable<any> {
    return this.getData('user-roles', params);
  }

  createUserRole(payload: any): Observable<any> {
    return this.postData('user-roles', payload);
  }

  updateUserRole(id: string | number, payload: any): Observable<any> {
    return this.putData('user-roles', payload, {}, id);
  }

  deleteUserRole(id: string | number): Observable<any> {
    return this.deleteData('user-roles', {}, id);
  }

  getUserRoleById(id: string | number): Observable<any> {
    return this.getData(`user-roles/${id}`);
  }

  // Feature operations
  getFeatures(params?: CrudParams): Observable<any> {
    return this.getData('plan-features', params);
  }

  createFeature(payload: any): Observable<any> {
    return this.postData('plan-features', payload);
  }

  updateFeature(id: string | number, payload: any): Observable<any> {
    return this.putData('plan-features', payload, {}, id);
  }

  deleteFeature(id: string | number): Observable<any> {
    return this.deleteData('plan-features', {}, id);
  }

  getFeatureById(id: string | number): Observable<any> {
    return this.getData(`plan-features/${id}`);
  }

  // Subscription plan operations
  getSubscriptionPlans(params?: CrudParams): Observable<any> {
    return this.getData('subscription-plans', params);
  }

  createSubscriptionPlan(payload: any): Observable<any> {
    return this.postData('subscription-plans', payload);
  }

  updateSubscriptionPlan(id: string | number, payload: any): Observable<any> {
    return this.putData('subscription-plans', payload, {}, id);
  }

  deleteSubscriptionPlan(id: string | number): Observable<any> {
    return this.deleteData('subscription-plans', {}, id);
  }

  getSubscriptionPlanById(id: string | number): Observable<any> {
    return this.getData(`subscription-plans/${id}`);
  }

  // Menu access permission operations
  getMenuAccessPermissions(params?: CrudParams): Observable<any> {
    return this.getData('menu-access-permissions', params);
  }

  createMenuAccessPermission(payload: any): Observable<any> {
    return this.postData('menu-access-permissions', payload);
  }

  updateMenuAccessPermission(id: string | number, payload: any): Observable<any> {
    return this.putData('menu-access-permissions', payload, {}, id);
  }

  deleteMenuAccessPermission(id: string | number): Observable<any> {
    return this.deleteData('menu-access-permissions', {}, id);
  }

  getMenuAccessPermissionsByRole(roleId: string | number): Observable<any> {
    return this.getData(`menu-access-permissions/role/${roleId}`);
  }

  // Menu operations (alias for getMenuItems)
  getNavigationMenus(params?: CrudParams): Observable<any> {
    return this.getData('navigation-menus', params);
  }

  createNavigationMenu(payload: any): Observable<any> {
    return this.postData('navigation-menus', payload);
  }

  updateNavigationMenu(id: string | number, payload: any): Observable<any> {
    return this.putData('navigation-menus', payload, {}, id);
  }

  deleteNavigationMenu(id: string | number): Observable<any> {
    return this.deleteData('navigation-menus', {}, id);
  }

  getNavigationMenuById(id: string | number): Observable<any> {
    return this.getData(`navigation-menus/${id}`);
  }

  getHeaderToken(): any {
    return { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken') || ''}` };
  }

  // Plan Feature Mapping operations (for plan-feature access mappings)
  getPlanFeatureMapping(params?: CrudParams): Observable<any> {
    return this.getData('plan-features-mapping', params);
  }

  createPlanFeatureMapping(payload: any): Observable<any> {
    return this.postData('plan-features-mapping', payload);
  }

  updatePlanFeatureMapping(id: string | number, payload: any): Observable<any> {
    return this.putData('plan-features-mapping', payload, {}, id);
  }

  deletePlanFeatureMapping(id: string | number): Observable<any> {
    return this.deleteData('plan-features-mapping', {}, id);
  }

  // Role Feature Mapping operations (for role-based feature access within plans)
  getRoleFeatureMapping(params?: CrudParams): Observable<any> {
    return this.getData('role-features-mapping', params);
  }

  createRoleFeatureMapping(payload: any): Observable<any> {
    return this.postData('role-features-mapping', payload);
  }

  updateRoleFeatureMapping(id: string | number, payload: any): Observable<any> {
    return this.putData('role-features-mapping', payload, {}, id);
  }

  deleteRoleFeatureMapping(id: string | number): Observable<any> {
    return this.deleteData('role-features-mapping', {}, id);
  }

  // Restaurant Subscription operations
  getRestaurantSubscriptions(params?: CrudParams): Observable<any> {
    return this.getData('restaurant-subscriptions', params);
  }

  getSystemPerformance(): Observable<any> {
    return this.getData('system-performance');
  }

  getPlatformDashboard(): Observable<any> {
    return this.getData('platform/dashboard');
  }

  getRestaurantSubscriptionById(id: string | number): Observable<any> {
    return this.getData(`restaurant-subscriptions/${id}`);
  }

  createRestaurantSubscription(payload: any): Observable<any> {
    return this.postData('restaurant-subscriptions', payload);
  }

  updateRestaurantSubscription(id: string | number, payload: any): Observable<any> {
    return this.putData('restaurant-subscriptions', payload, {}, id);
  }

  deleteRestaurantSubscription(id: string | number): Observable<any> {
    return this.deleteData('restaurant-subscriptions', {}, id);
  }

  // Subscription History operations
  getSubscriptionHistories(params?: CrudParams): Observable<any> {
    return this.getData('subscription-histories', params);
  }

  getSubscriptionHistoryById(id: string | number): Observable<any> {
    return this.getData(`subscription-histories/${id}`);
  }

  createSubscriptionHistory(payload: any): Observable<any> {
    return this.postData('subscription-histories', payload);
  }

  updateSubscriptionHistory(id: string | number, payload: any): Observable<any> {
    return this.putData('subscription-histories', payload, {}, id);
  }

  deleteSubscriptionHistory(id: string | number): Observable<any> {
    return this.deleteData('subscription-histories', {}, id);
  }

  // Customer operations

  getCustomers(params?: CrudParams): Observable<any> {
    return this.getData('customers', params);
  }

  getCustomerById(id: string | number): Observable<any> {
    return this.getData(`customers/${id}`);
  }

  getCustomerByCustomerId(customerId: string): Observable<any> {
    return this.getData(`customers/by-customer-id/${customerId}`);
  }

  createCustomer(payload: any): Observable<any> {
    return this.postData('customers', payload);
  }

  // Customer Auth operations (no token required)
  createCustomerAuth(payload: any): Observable<any> {
    const url = this.buildUrl('auth/customer/create');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, payload, { headers: httpHeaders });
  }

  validateCustomer(customerId: string | number, restaurantId: string | number): Observable<any> {
    const url = this.buildUrl(`auth/customer/validate/${restaurantId}/${customerId}`);
    console.log('*** validateCustomer called with URL:', url);
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(url, { headers: httpHeaders });
  }

  updateCustomer(id: string | number, payload: any): Observable<any> {
    return this.putData('customers', payload, {}, id);
  }

  deleteCustomer(id: string | number): Observable<any> {
    return this.deleteData('customers', {}, id);
  }

  // Customer-specific: active offers for a restaurant (is_active=true, date valid)
  getCustomerOffers(params?: CrudParams): Observable<any> {
    return this.getData('offers', params);
  }

  // ===============================
  // OFFER REDEMPTION OPERATIONS
  // ===============================

  getOfferRedemptions(params?: CrudParams): Observable<any> {
    return this.getData('offer-redemptions', params);
  }

  getOfferRedemptionsByCustomer(customerId: string | number): Observable<any> {
    return this.getData(`offer-redemptions/customer/${customerId}`);
  }

  createOfferRedemption(payload: any): Observable<any> {
    return this.postData('offer-redemptions', payload);
  }

  deleteOfferRedemption(id: string | number): Observable<any> {
    return this.deleteData('offer-redemptions', {}, id);
  }

  // Feature Category operations
  getFeatureCategories(params?: CrudParams): Observable<any> {
    return this.getData('feature-categories', params);
  }

  getFeatureCategoryById(id: string | number): Observable<any> {
    return this.getData(`feature-categories/${id}`);
  }

  createFeatureCategory(payload: any): Observable<any> {
    return this.postData('feature-categories', payload);
  }

  updateFeatureCategory(id: string | number, payload: any): Observable<any> {
    return this.putData('feature-categories', payload, {}, id);
  }

  deleteFeatureCategory(id: string | number): Observable<any> {
    return this.deleteData('feature-categories', {}, id);
  }

  // Navigation Menu Type operations
  getNavigationMenuTypes(params?: CrudParams): Observable<any> {
    return this.getData('navigation-menu-types', params);
  }

  getNavigationMenuTypeById(id: string | number): Observable<any> {
    return this.getData(`navigation-menu-types/${id}`);
  }

  createNavigationMenuType(payload: any): Observable<any> {
    return this.postData('navigation-menu-types', payload);
  }

  updateNavigationMenuType(id: string | number, payload: any): Observable<any> {
    return this.putData('navigation-menu-types', payload, {}, id);
  }

  deleteNavigationMenuType(id: string | number): Observable<any> {
    return this.deleteData('navigation-menu-types', {}, id);
  }

  // Feature Type operations
  getFeatureTypes(params?: CrudParams): Observable<any> {
    return this.getData('feature-types', params);
  }

  getFeatureTypeById(id: string | number): Observable<any> {
    return this.getData(`feature-types/${id}`);
  }

  createFeatureType(payload: any): Observable<any> {
    return this.postData('feature-types', payload);
  }

  updateFeatureType(id: string | number, payload: any): Observable<any> {
    return this.putData('feature-types', payload, {}, id);
  }

  deleteFeatureType(id: string | number): Observable<any> {
    return this.deleteData('feature-types', {}, id);
  }

  // User Type operations
  getUserTypes(params?: CrudParams): Observable<any> {
    return this.getData('user-types', params);
  }

  getUserTypeById(id: string | number): Observable<any> {
    return this.getData(`user-types/${id}`);
  }

  createUserType(payload: any): Observable<any> {
    return this.postData('user-types', payload);
  }

  updateUserType(id: string | number, payload: any): Observable<any> {
    return this.putData('user-types', payload, {}, id);
  }

  deleteUserType(id: string | number): Observable<any> {
    return this.deleteData('user-types', {}, id);
  }

  // Billing Cycle operations
  getBillingCycles(params?: CrudParams): Observable<any> {
    return this.getData('billing-cycles', params);
  }

  getBillingCycleById(id: string | number): Observable<any> {
    return this.getData(`billing-cycles/${id}`);
  }

  createBillingCycle(payload: any): Observable<any> {
    return this.postData('billing-cycles', payload);
  }

  updateBillingCycle(id: string | number, payload: any): Observable<any> {
    return this.putData('billing-cycles', payload, {}, id);
  }

  deleteBillingCycle(id: string | number): Observable<any> {
    return this.deleteData('billing-cycles', {}, id);
  }

  // Setup Fee operations
  getSetupFees(params?: CrudParams): Observable<any> {
    return this.getData('setup-fees', params);
  }

  getSetupFeeById(id: string | number): Observable<any> {
    return this.getData(`setup-fees/${id}`);
  }

  createSetupFee(payload: any): Observable<any> {
    return this.postData('setup-fees', payload);
  }

  updateSetupFee(id: string | number, payload: any): Observable<any> {
    return this.putData('setup-fees', payload, {}, id);
  }

  deleteSetupFee(id: string | number): Observable<any> {
    return this.deleteData('setup-fees', {}, id);
  }

  // Trial Day operations
  getTrialDays(params?: CrudParams): Observable<any> {
    return this.getData('trial-days', params);
  }

  getTrialDayById(id: string | number): Observable<any> {
    return this.getData(`trial-days/${id}`);
  }

  createTrialDay(payload: any): Observable<any> {
    return this.postData('trial-days', payload);
  }

  updateTrialDay(id: string | number, payload: any): Observable<any> {
    return this.putData('trial-days', payload, {}, id);
  }

  deleteTrialDay(id: string | number): Observable<any> {
    return this.deleteData('trial-days', {}, id);
  }

  // Restaurant Status operations
  getRestaurantStatuses(params?: CrudParams): Observable<any> {
    return this.getData('restaurant-statuses', params);
  }

  getRestaurantStatusById(id: string | number): Observable<any> {
    return this.getData(`restaurant-statuses/${id}`);
  }

  createRestaurantStatus(payload: any): Observable<any> {
    return this.postData('restaurant-statuses', payload);
  }

  updateRestaurantStatus(id: string | number, payload: any): Observable<any> {
    return this.putData('restaurant-statuses', payload, {}, id);
  }

  deleteRestaurantStatus(id: string | number): Observable<any> {
    return this.deleteData('restaurant-statuses', {}, id);
  }

  // State operations
  getStates(params?: CrudParams): Observable<any> {
    return this.getData('states', params);
  }

  getStateById(id: string | number): Observable<any> {
    return this.getData(`states/${id}`);
  }

  createState(payload: any): Observable<any> {
    return this.postData('states', payload);
  }

  updateState(id: string | number, payload: any): Observable<any> {
    return this.putData('states', payload, {}, id);
  }

  deleteState(id: string | number): Observable<any> {
    return this.deleteData('states', {}, id);
  }

  // ===============================
  // LOYALTY PROGRAM OPERATIONS
  // ===============================

  getLoyaltyPrograms(params?: CrudParams): Observable<any> {
    return this.getData('loyalty-programs', params);
  }

  getLoyaltyProgramByCustomer(customerId: string | number): Observable<NewLoyaltyProgram> {
    return this.getData(`loyalty-programs/customer/${customerId}`);
  }

  createLoyaltyProgram(payload: any): Observable<any> {
    return this.postData('loyalty-programs', payload);
  }

  updateLoyaltyProgram(id: string | number, payload: any): Observable<any> {
    return this.putData('loyalty-programs', payload, {}, id);
  }

  // ===============================
  // LOYALTY TRANSACTION OPERATIONS
  // ===============================

  getLoyaltyTransactions(params?: CrudParams): Observable<any> {
    return this.getData('loyalty-transactions', params);
  }

  getLoyaltyTransactionsByCustomer(customerId: string | number): Observable<any> {
    return this.getData(`loyalty-transactions/customer/${customerId}`);
  }

  createLoyaltyTransaction(payload: any): Observable<any> {
    return this.postData('loyalty-transactions', payload);
  }

  updateLoyaltyTransaction(id: string | number, payload: any): Observable<any> {
    return this.putData('loyalty-transactions', payload, {}, id);
  }

  deleteLoyaltyTransaction(id: string | number): Observable<any> {
    return this.deleteData('loyalty-transactions', {}, id);
  }

  // ===============================
  // BILLING PERIOD MONTHS OPERATIONS
  // ===============================

  getBillingPeriodMonths(params?: CrudParams): Observable<any> {
    return this.getData('billing-period-months', params);
  }

  createBillingPeriodMonth(payload: any): Observable<any> {
    return this.postData('billing-period-months', payload);
  }

  updateBillingPeriodMonth(id: string | number, payload: any): Observable<any> {
    return this.putData('billing-period-months', payload, {}, id);
  }

  deleteBillingPeriodMonth(id: string | number): Observable<any> {
    return this.deleteData('billing-period-months', {}, id);
  }

  // ===============================
  // INVENTORY ITEM CATEGORIES OPERATIONS
  // ===============================

  getInventoryItemCategories(params?: CrudParams): Observable<any> {
    return this.getData('inventory-item-categories', params);
  }

  createInventoryItemCategory(payload: any): Observable<any> {
    return this.postData('inventory-item-categories', payload);
  }

  updateInventoryItemCategory(id: string | number, payload: any): Observable<any> {
    return this.putData('inventory-item-categories', payload, {}, id);
  }

  deleteInventoryItemCategory(id: string | number): Observable<any> {
    return this.deleteData('inventory-item-categories', {}, id);
  }

  // ===============================
  // INVENTORY ITEM TYPES OPERATIONS
  // ===============================

  getInventoryItemTypes(params?: CrudParams): Observable<any> {
    return this.getData('inventory-item-types', params);
  }

  createInventoryItemType(payload: any): Observable<any> {
    return this.postData('inventory-item-types', payload);
  }

  updateInventoryItemType(id: string | number, payload: any): Observable<any> {
    return this.putData('inventory-item-types', payload, {}, id);
  }

  deleteInventoryItemType(id: string | number): Observable<any> {
    return this.deleteData('inventory-item-types', {}, id);
  }

  // ===============================
  // INVENTORY ITEM UNITS OPERATIONS
  // ===============================

  getInventoryItemUnits(params?: CrudParams): Observable<any> {
    return this.getData('inventory-item-units', params);
  }

  createInventoryItemUnit(payload: any): Observable<any> {
    return this.postData('inventory-item-units', payload);
  }

  updateInventoryItemUnit(id: string | number, payload: any): Observable<any> {
    return this.putData('inventory-item-units', payload, {}, id);
  }

  deleteInventoryItemUnit(id: string | number): Observable<any> {
    return this.deleteData('inventory-item-units', {}, id);
  }

  // ===============================
  // MENU CATEGORIES OPERATIONS
  // ===============================

  getMenuCategories(params?: CrudParams): Observable<any> {
    return this.getData('menu-categories', params);
  }

  createMenuCategory(payload: any): Observable<any> {
    return this.postData('menu-categories', payload);
  }

  updateMenuCategory(id: string | number, payload: any): Observable<any> {
    return this.putData('menu-categories', payload, {}, id);
  }

  deleteMenuCategory(id: string | number): Observable<any> {
    return this.deleteData('menu-categories', {}, id);
  }

  // ===============================
  // MENU ITEMS TYPE OPERATIONS
  // ===============================

  getMenuItemsTypes(params?: CrudParams): Observable<any> {
    return this.getData('menu-items-types', params);
  }

  createMenuItemsType(payload: any): Observable<any> {
    return this.postData('menu-items-types', payload);
  }

  updateMenuItemsType(id: string | number, payload: any): Observable<any> {
    return this.putData('menu-items-types', payload, {}, id);
  }

  deleteMenuItemsType(id: string | number): Observable<any> {
    return this.deleteData('menu-items-types', {}, id);
  }

  // ===============================
  // ORDER TYPE OPERATIONS
  // ===============================

  getOrderTypes(params?: CrudParams): Observable<any> {
    return this.getData('order-types', params);
  }

  createOrderType(payload: any): Observable<any> {
    return this.postData('order-types', payload);
  }

  updateOrderType(id: string | number, payload: any): Observable<any> {
    return this.putData('order-types', payload, {}, id);
  }

  deleteOrderType(id: string | number): Observable<any> {
    return this.deleteData('order-types', {}, id);
  }

  // ===============================
  // REPORT TYPE OPERATIONS
  // ===============================

  getReportTypes(params?: CrudParams): Observable<any> {
    return this.getData('report-types', params);
  }

  createReportType(payload: any): Observable<any> {
    return this.postData('report-types', payload);
  }

  updateReportType(id: string | number, payload: any): Observable<any> {
    return this.putData('report-types', payload, {}, id);
  }

  deleteReportType(id: string | number): Observable<any> {
    return this.deleteData('report-types', {}, id);
  }

  // ===============================
  // WASTE REASON TYPE OPERATIONS
  // ===============================

  getWasteReasonTypes(params?: CrudParams): Observable<any> {
    return this.getData('waste-reason-types', params);
  }

  createWasteReasonType(payload: any): Observable<any> {
    return this.postData('waste-reason-types', payload);
  }

  updateWasteReasonType(id: string | number, payload: any): Observable<any> {
    return this.putData('waste-reason-types', payload, {}, id);
  }

  deleteWasteReasonType(id: string | number): Observable<any> {
    return this.deleteData('waste-reason-types', {}, id);
  }

  // ===============================
  // WASTE TYPE OPERATIONS
  // ===============================

  getWasteTypes(params?: CrudParams): Observable<any> {
    return this.getData('waste-types', params);
  }

  createWasteType(payload: any): Observable<any> {
    return this.postData('waste-types', payload);
  }

  updateWasteType(id: string | number, payload: any): Observable<any> {
    return this.putData('waste-types', payload, {}, id);
  }

  deleteWasteType(id: string | number): Observable<any> {
    return this.deleteData('waste-types', {}, id);
  }
}