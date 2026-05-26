import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataTableComponent, DataTableColumn } from './data-table.component';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  const testColumns: DataTableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'date', label: 'Date', type: 'date' }
  ];

  const testData = [
    { name: 'Item A', amount: 100, date: '2024-01-01' },
    { name: 'Item B', amount: 200, date: '2024-01-02' },
    { name: 'Item C', amount: 300, date: '2024-01-03' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatProgressSpinnerModule
      ],
      declarations: [DataTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayedColumns', () => {
    it('should derive displayed columns from column config', () => {
      component.columns = testColumns;
      expect(component.displayedColumns).toEqual(['name', 'amount', 'date']);
    });

    it('should return empty array when no columns', () => {
      component.columns = [];
      expect(component.displayedColumns).toEqual([]);
    });
  });

  describe('skeletonRows', () => {
    it('should generate skeleton rows matching pageSize', () => {
      component.pageSize = 5;
      expect(component.skeletonRows.length).toBe(5);
    });

    it('should default to 10 skeleton rows', () => {
      expect(component.skeletonRows.length).toBe(10);
    });
  });

  describe('data binding', () => {
    it('should update dataSource when data input changes', () => {
      component.columns = testColumns;
      component.data = testData;
      component.ngOnChanges({
        data: { currentValue: testData, previousValue: [], firstChange: true, isFirstChange: () => true }
      });
      expect(component.dataSource.data).toEqual(testData);
    });

    it('should handle null data gracefully', () => {
      component.data = null as any;
      component.ngOnChanges({
        data: { currentValue: null, previousValue: [], firstChange: false, isFirstChange: () => false }
      });
      expect(component.dataSource.data).toEqual([]);
    });
  });

  describe('rowClick output', () => {
    it('should emit clicked row data', () => {
      spyOn(component.rowClick, 'emit');
      const row = { name: 'Item A', amount: 100 };
      component.onRowClick(row);
      expect(component.rowClick.emit).toHaveBeenCalledWith(row);
    });
  });

  describe('loading state', () => {
    it('should default to not loading', () => {
      expect(component.loading).toBeFalse();
    });

    it('should accept loading input', () => {
      component.loading = true;
      expect(component.loading).toBeTrue();
    });
  });

  describe('empty state', () => {
    it('should have default empty message', () => {
      expect(component.emptyMessage).toBe('No data available');
    });

    it('should accept custom empty message', () => {
      component.emptyMessage = 'No transactions found';
      expect(component.emptyMessage).toBe('No transactions found');
    });
  });

  describe('pagination', () => {
    it('should default pageSize to 10', () => {
      expect(component.pageSize).toBe(10);
    });

    it('should have default pageSizeOptions', () => {
      expect(component.pageSizeOptions).toEqual([5, 10, 25, 50]);
    });
  });
});
