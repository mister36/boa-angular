import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoneyDisplayComponent } from './money-display.component';

describe('MoneyDisplayComponent', () => {
  let component: MoneyDisplayComponent;
  let fixture: ComponentFixture<MoneyDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoneyDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MoneyDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formattedAmount', () => {
    it('should format standard currency $1,234.56', () => {
      component.amount = 1234.56;
      expect(component.formattedAmount).toBe('$1,234.56');
    });

    it('should format zero as $0.00', () => {
      component.amount = 0;
      expect(component.formattedAmount).toBe('$0.00');
    });

    it('should format negative value as -$500.00', () => {
      component.amount = -500;
      expect(component.formattedAmount).toBe('-$500.00');
    });

    it('should return masked **** when masked is true', () => {
      component.amount = 1234.56;
      component.masked = true;
      expect(component.formattedAmount).toBe('****');
    });

    it('should format compact value $1.2K', () => {
      component.amount = 1200;
      component.compact = true;
      expect(component.formattedAmount).toBe('$1.2K');
    });

    it('should format compact millions $1.5M', () => {
      component.amount = 1500000;
      component.compact = true;
      expect(component.formattedAmount).toBe('$1.5M');
    });

    it('should show + sign when showSign is true and amount is positive', () => {
      component.amount = 250;
      component.showSign = true;
      expect(component.formattedAmount).toBe('+$250.00');
    });

    it('should show - sign for negative amount with showSign', () => {
      component.amount = -250;
      component.showSign = true;
      expect(component.formattedAmount).toBe('-$250.00');
    });

    it('should not add sign for zero with showSign', () => {
      component.amount = 0;
      component.showSign = true;
      expect(component.formattedAmount).toBe('$0.00');
    });
  });

  describe('isNegative', () => {
    it('should return true for negative amounts', () => {
      component.amount = -100;
      expect(component.isNegative).toBeTrue();
    });

    it('should return false for positive amounts', () => {
      component.amount = 100;
      expect(component.isNegative).toBeFalse();
    });

    it('should return false for zero', () => {
      component.amount = 0;
      expect(component.isNegative).toBeFalse();
    });
  });

  describe('rendering', () => {
    it('should display formatted amount in the template', () => {
      component.amount = 999.99;
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent?.trim()).toContain('$999.99');
    });

    it('should add negative CSS class for negative amounts', () => {
      component.amount = -100;
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.money-display');
      expect(span.classList.contains('money-display--negative')).toBeTrue();
    });

    it('should add masked CSS class when masked', () => {
      component.masked = true;
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.money-display');
      expect(span.classList.contains('money-display--masked')).toBeTrue();
    });

    it('should set aria-label to "Balance hidden" when masked', () => {
      component.masked = true;
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.money-display');
      expect(span.getAttribute('aria-label')).toBe('Balance hidden');
    });
  });
});
