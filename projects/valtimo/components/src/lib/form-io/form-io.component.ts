/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormioForm} from 'angular-formio';
import {FormioRefreshValue} from 'angular-formio/formio.common';
import {FormioSubmission, ValtimoFormioOptions} from '@valtimo/contract';
import {UserProviderService} from '@valtimo/security';

@Component({
  selector: 'valtimo-form-io',
  templateUrl: './form-io.component.html',
  styleUrls: ['./form-io.component.css']
})
export class FormioComponent implements OnInit, OnChanges {

  @Input() form: any;
  @Input() options: ValtimoFormioOptions;
  @Output() submit: EventEmitter<any> = new EventEmitter();
  refreshForm: EventEmitter<FormioRefreshValue> = new EventEmitter();
  formDefinition: FormioForm;
  public errors: string[] = [];

  constructor(
    private userProviderService: UserProviderService
  ) {
  }

  ngOnInit() {
    this.formDefinition = this.form;
    this.errors = [];
    this.userProviderService.getToken().then((authToken: string) => {
      localStorage.setItem('formioToken', authToken);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.formDefinition = changes.form.currentValue;
    this.reloadForm();
  }

  reloadForm() {
    this.refreshForm.emit({
      form: this.formDefinition
    });
  }

  showErrors(errors: string[]) {
    this.errors = errors;
  }

  onSubmit(submission: FormioSubmission) {
    this.errors = [];
    this.submit.emit(submission);
  }

}
