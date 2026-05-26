import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { DEFAULT_FEATURE_FLAGS, FlagConfig, FEATURE_FLAG_DESCRIPTIONS } from '../models/feature-flag.models';

@Injectable()
export class FeatureFlagService {

  private flags$ = new BehaviorSubject<Record<string, boolean>>({ ...DEFAULT_FEATURE_FLAGS });

  isEnabled(flagName: string): boolean {
    const flags = this.flags$.getValue();
    return flags[flagName] ?? false;
  }

  isEnabled$(flagName: string): Observable<boolean> {
    return this.flags$.pipe(
      map(flags => flags[flagName] ?? false),
      distinctUntilChanged()
    );
  }

  getAllFlags(): Record<string, boolean> {
    return { ...this.flags$.getValue() };
  }

  getAllFlags$(): Observable<Record<string, boolean>> {
    return this.flags$.asObservable();
  }

  getFlagConfigs(): FlagConfig[] {
    const flags = this.flags$.getValue();
    return Object.entries(flags).map(([name, enabled]) => ({
      name,
      enabled,
      description: FEATURE_FLAG_DESCRIPTIONS[name]
    }));
  }

  setFlag(flagName: string, enabled: boolean): void {
    const current = this.flags$.getValue();
    this.flags$.next({
      ...current,
      [flagName]: enabled
    });
  }

  setFlags(overrides: Record<string, boolean>): void {
    const current = this.flags$.getValue();
    this.flags$.next({
      ...current,
      ...overrides
    });
  }

  resetToDefaults(): void {
    this.flags$.next({ ...DEFAULT_FEATURE_FLAGS });
  }
}
