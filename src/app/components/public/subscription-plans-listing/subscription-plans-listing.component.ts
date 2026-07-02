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

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.error = null;

    const plans$ = this.crudService.getSubscriptionPlans({ isActive: true });
    const features$ = this.crudService.getFeatures();
    const mappings$ = this.crudService.getPlanFeatureMapping();

    const sub = forkJoin([plans$, features$, mappings$]).subscribe({
      next: ([plansResponse, featuresResponse, mappingsResponse]) => {
        this.plans$.next((plansResponse.data || plansResponse || []) as SubscriptionPlan[]);
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
}

