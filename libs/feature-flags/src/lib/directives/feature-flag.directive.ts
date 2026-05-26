import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeatureFlagService } from '../services/feature-flag.service';

@Directive({
  selector: '[boaFeatureFlag]'
})
export class FeatureFlagDirective implements OnInit, OnDestroy {

  @Input('boaFeatureFlag') flagName!: string;
  @Input('boaFeatureFlagElse') elseTemplate?: TemplateRef<any>;

  private subscription?: Subscription;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private featureFlagService: FeatureFlagService
  ) {}

  ngOnInit(): void {
    this.subscription = this.featureFlagService.isEnabled$(this.flagName).subscribe(
      enabled => this.updateView(enabled)
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView(enabled: boolean): void {
    if (enabled && !this.hasView) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!enabled) {
      this.viewContainer.clear();
      if (this.elseTemplate) {
        this.viewContainer.createEmbeddedView(this.elseTemplate);
      }
      this.hasView = false;
    }
  }
}
