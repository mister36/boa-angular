import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';

@Directive({
  selector: '[boaTrackClick]'
})
export class AnalyticsDirective {
  @Input('boaTrackClick') eventLabel = '';
  @Input() boaTrackClickCategory?: string;
  @Input() boaTrackClickMetadata?: Record<string, unknown>;

  constructor(private analyticsService: AnalyticsService) {}

  @HostListener('click')
  onClick(): void {
    const metadata: Record<string, unknown> = {
      ...this.boaTrackClickMetadata
    };

    if (this.boaTrackClickCategory) {
      metadata['category'] = this.boaTrackClickCategory;
    }

    this.analyticsService.trackButtonClick(
      this.eventLabel,
      Object.keys(metadata).length > 0 ? metadata : undefined
    );
  }
}
