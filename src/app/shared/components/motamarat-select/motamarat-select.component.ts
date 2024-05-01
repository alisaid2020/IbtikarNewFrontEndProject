import {
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
import {
  AbstractControl,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
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
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../services/data.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-motamarat-select',
  templateUrl: './motamarat-select.component.html',
})
export class MotamaratSelectComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: any = [];
  @Input() label?: string;
  @Input() placeholder!: string;
  @Input() bindLabel!: string;
  @Input() bindValue!: string;
  @Input() IsMultiple!: boolean;
  @Input() uid: any;
  @Input() disabled!: boolean;
  @Input() clearable = true;
  @Input() searchable = true;
  @Input() control!: AbstractControl;
  @Input() hasStaticValues?: boolean;
  @Input() isAddTag?: any;
  @Input() patternMessage?: string;
  @Input() hasMultipleLabels: boolean;
  @Input() firstLabel!: string;
  @Input() secondLabel!: string;
  @Input() apiUrl!: string;
  @Input() queryParams: object;

  @ViewChild('select', { static: false }) selectComponent: NgSelectComponent;

  loading = false;
  searchInput$ = new Subject<string>();
  asyncedItems$: Observable<any[]>;
  subs: Subscription[] = [];

  @Output() emitChanged = new EventEmitter<any>();

  validators = Validators;

  constructor(
    public translate: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    if (this.hasStaticValues) {
      this.translateStaticItems();
      this.subs.push(
        this.translate.onLangChange.subscribe((_) => {
          this.translateStaticItems();
        })
      );
    }
    if (this.apiUrl) {
      this.loadSyncedItems();
      if (this.formControl.value) {
        this.formControl.patchValue(
          eval(`this.formControl.value.${this.bindValue}`)
        );
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.items?.isFirstChange()) {
      this.selectComponent?.blur();
      // this.selectComponent?.focus();
    }

    if (changes.items?.currentValue && !this.hasStaticValues) {
      const item = changes.items?.currentValue.find(
        (x: any) => x.id === this.control.value
      );

      if (!item) {
        this.control.patchValue(null);
        this.selectComponent?.blur();
        // this.selectComponent?.focus();
      }
    }
  }

  get formControl(): UntypedFormControl {
    return this.control as UntypedFormControl;
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
          this.translate.get(`${item.name}`)
        );
        return {
          ...item,
          translatedName: translatedValue,
        };
      })
    );
  }
  searchByLabelInDynamic(term: string, item: any) {
    term = term.toLocaleLowerCase();
    if (item?.arabicAddress && item?.englishAddress) {
      return (
        item.arabicAddress?.toLocaleLowerCase().indexOf(term) > -1 ||
        item.englishAddress?.toLocaleLowerCase().indexOf(term) > -1
      );
    }
    if (item?.arabicTitle && item?.englishTitle) {
      return (
        item.arabicTitle?.toLocaleLowerCase().indexOf(term) > -1 ||
        item.englishTitle?.toLocaleLowerCase().indexOf(term) > -1
      );
    }
    if (item?.arabicName && item?.englishName) {
      return (
        item.arabicName?.toLocaleLowerCase().indexOf(term) > -1 ||
        item.englishName?.toLocaleLowerCase().indexOf(term) > -1
      );
    }
    if (item?.user?.fullName) {
      return item.user.fullName?.toLocaleLowerCase().indexOf(term) > -1;
    }
    if (item?.fullName) {
      return item.fullName?.toLocaleLowerCase().indexOf(term) > -1;
    }
    if (item?.name) {
      return item.name?.toLocaleLowerCase().indexOf(term) > -1;
    }
    if (item?.title) {
      return item.title?.toLocaleLowerCase().indexOf(term) > -1;
    }
  }

  searchByLabelInStatic(term: any, item: any) {
    term = term.toLocaleLowerCase();
    return item.translatedName?.includes(term);
  }

  private loadSyncedItems() {
    this.asyncedItems$ = concat(
      of([this.formControl.value && this.formControl.value]), // default items
      this.searchInput$.pipe(
        distinctUntilChanged(),
        tap(() => (this.loading = true)),
        switchMap((term) => {
          let params = {
            keyword: term,
          };
          if (this.queryParams) {
            params = {
              ...params,
              ...this.queryParams,
            };
          }
          return this.dataService
            .get(this.apiUrl, {
              params,
            })
            .pipe(
              catchError(() => of([])), // empty list on error
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
