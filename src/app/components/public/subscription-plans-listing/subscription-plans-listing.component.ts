import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription, forkJoin } from 'rxjs';
import { CrudService } from '../../../services/crud.service';
import { ManagedFeature, PlanFeatureMapping, SubscriptionPlan } from '../../../services/mock-data.service';

@Component({
  selector: 'app-subscription-plans-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plans-listing.component.html',
  styleUrl: './subscription-plans-listing.component.css'
})
export class SubscriptionPlansListingComponent implements OnInit {
  plans$ = new BehaviorSubject<SubscriptionPlan[]>([]);
  features: ManagedFeature[] = [];
  planFeatures: PlanFeatureMapping[] = [];
  loading = true;
  error: string | null = null;
  expandedFeaturesMap: Map<number, boolean> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(private crudService: CrudService) {}

  planThemes = [
    'bg-gradient-to-br from-violet-500 to-indigo-700',
    'bg-gradient-to-br from-orange-400 to-red-600',
    'bg-gradient-to-br from-emerald-400 to-teal-600'
  ];

  hoverBorders = [
    'hover:border-violet-300 dark:hover:border-violet-600',
    'hover:border-orange-300 dark:hover:border-orange-600',
    'hover:border-emerald-300 dark:hover:border-emerald-600'
  ];

  getTheme(index: number): string {
    return this.planThemes[index] || this.planThemes[0];
  }

  getHoverBorder(index: number): string {
    return this.hoverBorders[index] || this.hoverBorders[0];
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.error = null;

    const activePlans$ = this.crudService.getSubscriptionPlans({ isActive: true, isComingSoon: false });
    const comingSoonPlans$ = this.crudService.getSubscriptionPlans({ isComingSoon: true });
    const features$ = this.crudService.getFeatures();
    const mappings$ = this.crudService.getPlanFeatureMapping();

    const sub = forkJoin([activePlans$, comingSoonPlans$, features$, mappings$]).subscribe({
      next: ([activePlansResponse, comingSoonPlansResponse, featuresResponse, mappingsResponse]) => {
        const activePlans = (activePlansResponse.data || activePlansResponse || []) as SubscriptionPlan[];
        const comingSoonPlans = (comingSoonPlansResponse.data || comingSoonPlansResponse || []) as SubscriptionPlan[];
        const sortedPlans = [...activePlans, ...comingSoonPlans].sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        this.plans$.next(sortedPlans);
        this.features = (featuresResponse.data || featuresResponse || []) as ManagedFeature[];
        this.planFeatures = (mappingsResponse.data || mappingsResponse || []) as PlanFeatureMapping[];
      },
      error: (err) => {
        this.error = 'Failed to load plans';
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  getPlanFeatures(planId: number): ManagedFeature[] {
    const enabledIds = this.planFeatures
      .filter(pf => pf.plan_id === planId && pf.is_enabled)
      .map(pf => pf.feature_id);

    return this.features.filter(f => enabledIds.includes(f.feature_id));
  }

  toggleFeaturesExpansion(planId: number): void {
    const current = this.expandedFeaturesMap.get(planId) || false;
    this.expandedFeaturesMap.set(planId, !current);
  }

  isFeaturesExpanded(planId: number): boolean {
    return this.expandedFeaturesMap.get(planId) || false;
  }

  getDiscountedPrice(price: number, discountPercentage: number = 0): number {
    return price * (1 - discountPercentage / 100);
  }
}

