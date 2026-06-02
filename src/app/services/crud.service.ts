import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudParams, CrudHeaders } from './mock-data.service';
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

  getOrdersForReports(startDate: string, endDate: string, status: string = 'COMPLETED'): Observable<any> {
    const url = this.buildUrl('orders/reports');
    const httpParams = this.buildParams({
      startDate: startDate,
      endDate: endDate,
      status: status
    });

    return this.http.get(url, { params: httpParams });
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

  getCurrentOrders(): Observable<any> {
    return this.getData('current-orders');
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
}