import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.scss'],
})
export class SubmitButtonComponent {
  @Input() buttonText: string;
  @Input() isDisabled: any;
  @Output() btnClick = new EventEmitter();

  constructor(public loadingService: LoadingService) {}

  onClick(): void {
    this.btnClick.emit();
  }
}
