import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfirmationDialogData } from '../components/common/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private dialogStateSubject = new BehaviorSubject<ConfirmationDialogData | null>(null);
  public dialogState$ = this.dialogStateSubject.asObservable();

  private resolvePromise: ((value: boolean) => void) | null = null;

  constructor() {}

  confirm(
    message: string,
    title: string = 'Confirm Action',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.resolvePromise = resolve;
      this.dialogStateSubject.next({
        title,
        message,
        confirmText,
        cancelText
      });
    });
  }

  confirmResult(result: boolean): void {
    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
    this.dialogStateSubject.next(null);
  }
}