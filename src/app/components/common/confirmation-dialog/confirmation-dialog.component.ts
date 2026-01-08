import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="dialogData" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ dialogData.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Please confirm your action</p>
            </div>
          </div>
          <button
            (click)="onCancel()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <i class="fas fa-times text-gray-500 dark:text-gray-400"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ dialogData.message }}
          </p>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            (click)="onCancel()"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
            {{ dialogData.cancelText || 'Cancel' }}
          </button>
          <button
            (click)="onConfirm()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
            {{ dialogData.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  dialogData: ConfirmationDialogData | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private confirmationService: ConfirmationDialogService) {}

  ngOnInit(): void {
    this.subscription = this.confirmationService.dialogState$.subscribe((data: ConfirmationDialogData | null) => {
      this.dialogData = data;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onConfirm(): void {
    this.confirmationService.confirmResult(true);
  }

  onCancel(): void {
    this.confirmationService.confirmResult(false);
  }
}