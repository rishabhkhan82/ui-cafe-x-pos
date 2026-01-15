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

  // Menu operations
  getMenuItems(params?: CrudParams): Observable<any> {
    return this.getData('menu', params);
  }

  createMenuItem(payload: any): Observable<any> {
    return this.postData('menu', payload);
  }

  updateMenuItem(id: string, payload: any): Observable<any> {
    return this.putData('menu', payload, {}, id);
  }

  deleteMenuItem(id: string): Observable<any> {
    return this.deleteData('menu', {}, id);
  }

  // Order operations
  getOrders(params?: CrudParams): Observable<any> {
    return this.getData('orders', params);
  }

  createOrder(payload: any): Observable<any> {
    return this.postData('orders', payload);
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
}