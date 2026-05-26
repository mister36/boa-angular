import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'boa-loading-skeleton',
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSkeletonComponent {
  @Input() variant: 'card' | 'table' | 'text' = 'text';
  @Input() rows = 3;

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  get columns(): number[] {
    return [0, 1, 2, 3];
  }

  getTextWidth(index: number): string {
    const widths = ['100%', '85%', '70%', '90%', '60%', '95%', '75%', '80%'];
    return widths[index % widths.length];
  }
}
