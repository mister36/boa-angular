import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'boa-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavComponent {
  @Input() navItems: NavItem[] = [];
  @Input() collapsed = false;

  @Output() navItemClick = new EventEmitter<NavItem>();

  onItemClick(item: NavItem): void {
    this.navItemClick.emit(item);
  }
}
