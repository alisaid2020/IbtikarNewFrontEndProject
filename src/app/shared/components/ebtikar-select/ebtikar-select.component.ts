import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import {
  Subscription,
  firstValueFrom,
  Subject,
  Observable,
  concat,
  of,
  distinctUntilChanged,
  tap,
  switchMap,
  catchError,
  filter,
  debounceTime,
  map,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { HelpersService } from '@services/helpers.service';

@Component({
  selector: 'app-ebtikar-select',
  templateUrl: './ebtikar-select.component.html',
})
export class EbtikarSelectComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: any = [];
  @Input() label?: string;
  @Input() placeholder!: string;
  @Input() bindLabel!: string;
  @Input() bindValue!: string;
  @Input() IsMultiple!: boolean;
  @Input() disabled!: boolean;
  @Input() clearable = true;
  @Input() searchable = true;
  @Input() control!: AbstractControl;
  @Input() hasStaticValues?: boolean;
  @Input() isAddTag?: any;
  @Input() hasMultipleLabels: boolean;
  @Input() isPaginated!: boolean;
  @Input() queryParams: object;
  @Input() apiUrl!: string;
  @Input() customData: any[];
  @Input() isAddNewLine?: any;
  @Input() uid?: any;
  @Input() searchByTerm: boolean;
  @Input() searchByBarcode: boolean;

  @Output() emitChanged = new EventEmitter<any>();

  @ViewChild('select', { static: false }) selectComponent: NgSelectComponent;

  pageNo = 1;
  loading = false;
  searchInput$ = new Subject<string>();
  asyncedItems$: Observable<any[]>;
  subs: Subscription[] = [];
  pagination: any;
  validators = Validators;

  constructor(
    public translate: TranslateService,
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    public helpers: HelpersService
  ) {}

  ngOnInit(): void {
    if (this.uid) {
      this.formControl.patchValue(this.uid);
    }
    if (this.hasStaticValues && this.items?.length) {
      this.translateStaticItems();
      this.subs.push(
        this.translate.onLangChange.subscribe((_) => {
          this.translateStaticItems();
        })
      );
    }

    if (this.apiUrl || (this.apiUrl && this.isPaginated)) {
      this.loadSyncedItems();
      if (this.formControl?.value) {
        this.formControl.patchValue(
          eval(`this.formControl.value.${this.bindValue}`)
        );
      }
      return;
    }

    if (this.isPaginated && !this.apiUrl) {
      this.getPaginatedData();
      return;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.items?.isFirstChange()) {
      this.selectComponent?.blur();
    }
    if (changes.items?.currentValue && !this.hasStaticValues) {
      const item = changes.items?.currentValue.find(
        (x: any) => x.id === this.control.value
      );
      if (!item) {
        this.control.patchValue(null);
        this.selectComponent?.blur();
      }
    }
    if (this.apiUrl && changes?.customData?.currentValue) {
      this.customData = changes.customData.currentValue;
      this.loadSyncedItems();
    }
  }

  get formControl(): FormControl {
    return this.control as FormControl;
  }

  getChangedItem(ev: any): void {
    this.emitChanged.emit(ev);
  }

  trackByFn(item: any) {
    return item.id;
  }

  async translateStaticItems() {
    this.items = await Promise.all(
      this.items.map(async (item: any) => {
        const translatedValue = await firstValueFrom(
          this.translate.get(`${item[this.bindLabel]}`)
        );
        return {
          ...item,
          translatedName: translatedValue,
        };
      })
    );
  }

  searchByLabelInDynamic(term: string, item: any) {
    term = term?.toLocaleLowerCase();
    if (item?.NameAr && item?.NameEn) {
      return (
        item?.NameAr?.toLocaleLowerCase()?.indexOf(term) > -1 ||
        item?.NameEn?.toLocaleLowerCase()?.indexOf(term) > -1
      );
    }
  }

  searchByLabelInStatic(term: any, item: any) {
    term = term.toLocaleLowerCase();
    return item.translatedName?.includes(term);
  }

  fetchMore(): void {
    this.pageNo += 1;
    if (this.items?.length >= this.pagination.totalItems!) {
      return;
    }
    if (this.isPaginated && !this.apiUrl) {
      this.getPaginatedData(this.pagination.currentPage + 1);
    }
    if (this.apiUrl || (this.isPaginated && this.apiUrl)) {
      this.loadSyncedItems();
    }
  }

  getPaginatedData(PageNumber: number = 1) {
    this.loading = true;
    let params: any = {
      // PageNumber,
      // PageSize: PAGE_SIZE,
    };
    if (this.selectComponent?.searchTerm) {
      params.keyword = this.selectComponent.searchTerm;
    }
    if (this.queryParams) {
      params = {
        ...params,
        ...this.queryParams,
      };
    }
    firstValueFrom(
      this.dataService
        .get(this.apiUrl, {
          params,
        })
        .pipe(
          tap((res) => {
            this.items = [this.items, ...res.Obj];
            this.loading = false;
          })
        )
    );
  }

  private loadSyncedItems() {
    this.asyncedItems$ = concat(
      of(this.customData || []),
      this.searchInput$.pipe(
        distinctUntilChanged(),
        debounceTime(300),
        filter((term) => !!term),
        tap((ـ) => (this.loading = true)),
        switchMap((term) => {
          let params: any = {};
          if (this.searchByTerm) {
            params['trim'] = term;
          }
          if (this.searchByBarcode) {
            params['barcode'] = term;
          }
          return this.dataService.get(`${this.apiUrl}`, { params }).pipe(
            catchError(() => of([])), // empty list on error
            map((res) => res.Obj),
            tap(() => (this.loading = false))
          );
        })
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
