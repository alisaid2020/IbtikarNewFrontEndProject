import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HelpersService } from '@services/helpers.service';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input() modalInfo: any;

  constructor(public modal: NgbActiveModal, public helpers: HelpersService) {}
}
