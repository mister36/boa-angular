import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AccountCardComponent } from './account-card.component';
import { MoneyDisplayComponent } from '../money-display/money-display.component';

describe('AccountCardComponent', () => {
  let component: AccountCardComponent;
  let fixture: ComponentFixture<AccountCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatCardModule, MatIconModule],
      declarations: [AccountCardComponent, MoneyDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('maskedNumber', () => {
    it('should mask account number showing only last 4 digits', () => {
      component.accountNumber = '1234567890';
      expect(component.maskedNumber).toBe('****7890');
    });

    it('should return short numbers as-is', () => {
      component.accountNumber = '123';
      expect(component.maskedNumber).toBe('123');
    });

    it('should return empty string for empty input', () => {
      component.accountNumber = '';
      expect(component.maskedNumber).toBe('');
    });

    it('should handle exactly 4 digits', () => {
      component.accountNumber = '1234';
      expect(component.maskedNumber).toBe('1234');
    });
  });

  describe('accountIcon', () => {
    it('should return account_balance for checking', () => {
      component.accountType = 'checking';
      expect(component.accountIcon).toBe('account_balance');
    });

    it('should return savings for savings', () => {
      component.accountType = 'savings';
      expect(component.accountIcon).toBe('savings');
    });

    it('should return credit_card for credit', () => {
      component.accountType = 'credit';
      expect(component.accountIcon).toBe('credit_card');
    });

    it('should return request_quote for loan', () => {
      component.accountType = 'loan';
      expect(component.accountIcon).toBe('request_quote');
    });
  });

  describe('statusClass', () => {
    it('should return status-badge--active for active', () => {
      component.status = 'active';
      expect(component.statusClass).toBe('status-badge--active');
    });

    it('should return status-badge--frozen for frozen', () => {
      component.status = 'frozen';
      expect(component.statusClass).toBe('status-badge--frozen');
    });

    it('should return status-badge--closed for closed', () => {
      component.status = 'closed';
      expect(component.statusClass).toBe('status-badge--closed');
    });
  });

  describe('cardClick output', () => {
    it('should emit when onClick is called', () => {
      spyOn(component.cardClick, 'emit');
      component.onClick();
      expect(component.cardClick.emit).toHaveBeenCalled();
    });

    it('should emit on card element click', () => {
      spyOn(component.cardClick, 'emit');
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('mat-card');
      card.click();
      expect(component.cardClick.emit).toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      component.accountName = 'Checking Account';
      component.accountNumber = '9876543210';
      component.balance = 5432.10;
      component.accountType = 'checking';
      component.status = 'active';
      fixture.detectChanges();
    });

    it('should display the account name', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Checking Account');
    });

    it('should display the masked number', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('****3210');
    });

    it('should display the status badge', () => {
      const badge = fixture.nativeElement.querySelector('.status-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent?.trim().toLowerCase()).toContain('active');
    });

    it('should set proper aria-label', () => {
      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card.getAttribute('aria-label')).toContain('Checking Account');
      expect(card.getAttribute('aria-label')).toContain('****3210');
    });
  });
});
