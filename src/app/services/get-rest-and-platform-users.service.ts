import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CrudService } from './crud.service';
import { User } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class GetRestAndPlatformUsersService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private crudService: CrudService) { }

  getNotificationRecipients(restaurantId: string, roles?: string[]): Observable<User[]> {
    const payload: any = { restaurantId };
    if (roles && roles.length > 0) {
      payload.roles = roles;
    }
    return this.crudService.postData('notification-users/recipients', payload);
  }
}
