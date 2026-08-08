import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { CrudService } from '../../../services/crud.service';
import { RealtimeService } from '../../../services/realtime.service';
import { Review } from '../../../interfaces';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ReviewMode = 'customer' | 'admin' | 'public';

@Component({
  selector: 'app-common-ratings-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './common-ratings-reviews.component.html',
  styleUrl: './common-ratings-reviews.component.css'
})
export class CommonRatingsReviewsComponent implements OnInit, OnDestroy {
  @Input() restaurantId!: number;
  @Input() mode: ReviewMode = 'public';

  reviews: Review[] = [];
  topLevelReviews: Review[] = [];
  repliesMap: { [parentId: number]: Review[] } = {};

  averageRating = 0;
  totalReviews = 0;
  ratingDistribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;

  showReviewForm = false;
  replyToId: number | null = null;
  replyFormText = '';

  reviewForm = {
    rating: 0,
    reviewText: ''
  };

  editingReviewId: number | null = null;
  isEditing = false;

  fieldErrors: { [key: string]: string } = {};
  errorMessage = '';
  private subscriptions: Subscription[] = [];
  private refreshSubject = new Subject<void>();

  constructor(
    public loadingService: LoadingService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private crudService: CrudService,
    private realtimeService: RealtimeService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!this.restaurantId && currentUser) {
      const fromUser = currentUser['restaurant_id'] ?? currentUser['restaurantId'];
      if (fromUser) {
        this.restaurantId = Number(fromUser);
      }
    }

    if (this.mode === 'public') {
      if (currentUser) {
        if (currentUser.role === 'customer') {
          this.mode = 'customer';
        } else if (['restaurant_owner', 'restaurant_manager', 'kitchen_manager'].includes(currentUser.role)) {
          this.mode = 'admin';
        }
      }
    }

    this.loadReviews();

    const reviewSub = this.realtimeService.reviewUpdate$.subscribe((update: any) => {
      if (update) {
        const currentRestaurantId = this.restaurantId;
        const updateRestaurantId = update.restaurantId || update.restaurant_id;
        if (currentRestaurantId && String(updateRestaurantId) === String(currentRestaurantId)) {
          console.log('Review updated in real-time, reloading...');
          this.loadReviews();
        }
      }
    });
    this.subscriptions.push(reviewSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get canWriteReview(): boolean {
    return this.mode === 'customer' || this.mode === 'admin';
  }

  get canReply(): boolean {
    return this.mode === 'admin';
  }

  get canDelete(): boolean {
    return this.mode === 'admin';
  }

  get canEdit(): boolean {
    return this.mode === 'customer';
  }

  get currentCustomerId(): number {
    const user = this.authService.getCurrentUser();
    return Number(user?.id) || 0;
  }

  loadReviews(): void {
    if (!this.restaurantId) return;

    this.loadingService.show();
    this.errorMessage = '';

    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage,
      restaurantId: this.restaurantId,
      isActive: 'true',
      isVisible: 'true'
    };

    this.crudService.getReviews(params).subscribe({
      next: (response: any) => {
        const raw = response.data || [];
        this.reviews = raw.map((review: any) => ({
          id: review.id,
          restaurantId: review.restaurant_id || review.restaurantId || 0,
          customerId: review.customer_id || review.customerId || 0,
          rating: review.rating || 0,
          reviewText: review.review_text || review.reviewText || '',
          parentReviewId: review.parent_review_id ?? review.parentReviewId ?? undefined,
          isActive: review.is_active ?? review.isActive ?? true,
          isVisible: review.is_visible ?? review.isVisible ?? true,
          createdBy: review.created_by ?? review.createdBy,
          updatedBy: review.updated_by ?? review.updatedBy,
          createdAt: review.created_at ? new Date(review.created_at) : undefined,
          updatedAt: review.updated_at ? new Date(review.updated_at) : undefined
        }));

        this.totalPages = response.pageCount || 1;
        this.totalElements = response.totalRowCount || 0;

        this.topLevelReviews = this.reviews.filter(r => !r.parentReviewId);
        this.repliesMap = this.buildRepliesMap(this.reviews);
        this.calculateAverageRating();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        const apiMessage = error.error?.message || 'Failed to load reviews. Please try again.';
        this.errorMessage = apiMessage;
        this.notificationService.error('Error', apiMessage);
        this.loadingService.hide();
      }
    });
  }

  private buildRepliesMap(reviews: Review[]): { [parentId: number]: Review[] } {
    const map: { [parentId: number]: Review[] } = {};
    reviews.forEach(review => {
      if (review.parentReviewId) {
        if (!map[review.parentReviewId]) {
          map[review.parentReviewId] = [];
        }
        map[review.parentReviewId].push(review);
      }
    });
    return map;
  }

  private calculateAverageRating(): void {
    if (this.topLevelReviews.length === 0) {
      this.averageRating = 0;
      this.totalReviews = 0;
      this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      return;
    }

    const total = this.topLevelReviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = parseFloat((total / this.topLevelReviews.length).toFixed(1));
    this.totalReviews = this.topLevelReviews.length;

    this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.topLevelReviews.forEach(review => {
      const rating = Math.max(1, Math.min(5, review.rating));
      this.ratingDistribution[rating]++;
    });
  }

  getRatingPercentage(rating: number): number {
    if (this.totalReviews === 0) return 0;
    return Math.round((this.ratingDistribution[rating] / this.totalReviews) * 100);
  }

  setRating(stars: number): void {
    this.reviewForm.rating = stars;
    delete this.fieldErrors['rating'];
  }

  getStarClass(rating: number, index: number): string {
    if (index <= rating) {
      return 'fas fa-star text-yellow-400';
    }
    return 'far fa-star text-gray-300';
  }

  getAverageStarClass(index: number): string {
    return this.getStarClass(Math.round(this.averageRating), index);
  }

  openReviewForm(): void {
    this.showReviewForm = true;
    this.isEditing = false;
    this.editingReviewId = null;
    this.reviewForm = { rating: 0, reviewText: '' };
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  startEditReview(review: Review): void {
    this.isEditing = true;
    this.editingReviewId = review.id;
    this.reviewForm = {
      rating: review.rating || 0,
      reviewText: review.reviewText || ''
    };
    this.fieldErrors = {};
    this.errorMessage = '';
    this.showReviewForm = true;
  }

  closeReviewForm(): void {
    this.showReviewForm = false;
    this.replyToId = null;
    this.replyFormText = '';
    this.reviewForm = { rating: 0, reviewText: '' };
    this.isEditing = false;
    this.editingReviewId = null;
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  cancelEditReview(): void {
    this.closeReviewForm();
  }

  openReplyForm(reviewId: number): void {
    this.replyToId = reviewId;
    this.replyFormText = '';
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  closeReplyForm(): void {
    this.replyToId = null;
    this.replyFormText = '';
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  onSubmitReview(): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    if (!this.reviewForm.rating || this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
      this.fieldErrors['rating'] = 'Please select a rating';
    }

    if (!this.reviewForm.reviewText || this.reviewForm.reviewText.trim() === '') {
      this.fieldErrors['reviewText'] = 'Review text is required';
    }

    if (Object.keys(this.fieldErrors).length > 0) {
      return;
    }

    if (this.isEditing && this.editingReviewId) {
      this.submitEditReview(this.editingReviewId);
    } else {
      this.submitReview();
    }
  }

  onSubmitReply(parentReviewId: number): void {
    this.fieldErrors = {};
    this.errorMessage = '';

    if (!this.replyFormText || this.replyFormText.trim() === '') {
      this.fieldErrors['replyText'] = 'Reply text is required';
    }

    if (Object.keys(this.fieldErrors).length > 0) {
      return;
    }

    this.submitReply(parentReviewId);
  }

  private submitReview(): void {
    this.loadingService.show();

    const currentUser = this.authService.getCurrentUser();
    const payload = {
      restaurant_id: this.restaurantId,
      customer_id: Number(currentUser?.id) || 0,
      rating: this.reviewForm.rating,
      review_text: this.reviewForm.reviewText.trim(),
      parent_review_id: null,
      user_type: currentUser?.user_type || 'customer',
      is_active: true,
      is_visible: true,
      created_by: Number(currentUser?.id) || 0,
      updated_by: Number(currentUser?.id) || 0
    };

    this.crudService.createReview(payload).subscribe({
      next: (response) => {
        console.log('Review created successfully:', response);
        this.notificationService.success('Review Submitted', 'Thank you for your review!');
        this.closeReviewForm();
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error creating review:', error);
        const apiMessage = error.error?.message || 'Failed to submit review. Please try again.';
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

        const existingReview = this.findExistingCustomerReview(Number(currentUser?.id));
        if (existingReview && apiMessage.toLowerCase().includes('already submitted')) {
          this.notificationService.info('Review Exists', 'You have already submitted a review. You can edit your existing review.');
          this.startEditReview(existingReview);
          return;
        }

        this.notificationService.error('Submission Failed', apiMessage);
      }
    });
  }

  private submitEditReview(reviewId: number): void {
    this.loadingService.show();

    const currentUser = this.authService.getCurrentUser();
    const payload = {
      restaurant_id: this.restaurantId,
      customer_id: Number(currentUser?.id) || 0,
      rating: this.reviewForm.rating,
      review_text: this.reviewForm.reviewText.trim(),
      parent_review_id: null,
      user_type: currentUser?.user_type || 'customer',
      is_active: true,
      is_visible: true,
      updated_by: Number(currentUser?.id) || 0
    };

    this.crudService.updateReview(reviewId, payload).subscribe({
      next: (response) => {
        console.log('Review updated successfully:', response);
        this.notificationService.success('Review Updated', 'Your review has been updated.');
        this.closeReviewForm();
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error updating review:', error);
        const apiMessage = error.error?.message || 'Failed to update review. Please try again.';
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
      }
    });
  }

  private findExistingCustomerReview(customerId: number): Review | undefined {
    return this.topLevelReviews.find(r => r.customerId === customerId && !r.parentReviewId);
  }

  private submitReply(parentReviewId: number): void {
    this.loadingService.show();

    const currentUser = this.authService.getCurrentUser();
    const payload = {
      restaurant_id: this.restaurantId,
      customer_id: Number(currentUser?.id) || 0,
      rating: 5,
      review_text: this.replyFormText.trim(),
      parent_review_id: parentReviewId,
      user_type: currentUser?.user_type || 'admin',
      is_active: true,
      is_visible: true,
      created_by: Number(currentUser?.id) || 0,
      updated_by: Number(currentUser?.id) || 0
    };

    this.crudService.createReview(payload).subscribe({
      next: (response) => {
        console.log('Reply submitted successfully:', response);
        this.notificationService.success('Reply Posted', 'Your reply has been posted.');
        this.closeReplyForm();
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error submitting reply:', error);
        const apiMessage = error.error?.message || 'Failed to post reply. Please try again.';
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

        this.notificationService.error('Reply Failed', apiMessage);
      }
    });
  }

  deleteReview(review: Review): void {
    const confirmed = confirm('Are you sure you want to delete this review?');
    if (!confirmed) return;

    this.loadingService.show();
    this.crudService.deleteReview(review.id).subscribe({
      next: () => {
        console.log('Review deleted successfully:', review.id);
        this.notificationService.success('Deleted', 'Review has been deleted.');
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        const apiMessage = error.error?.message || 'Failed to delete review. Please try again.';
        this.errorMessage = apiMessage;
        this.loadingService.hide();
        this.notificationService.error('Delete Failed', apiMessage);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReviews();
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getCustomerName(review: Review): string {
    return `Customer #${review.customerId}`;
  }

  formatDate(dateString: string | Date | undefined | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  get paginationRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalElements);
    return `${start}-${end}`;
  }

  get showPagination(): boolean {
    return this.totalPages > 1;
  }

  Math = Math;
}
