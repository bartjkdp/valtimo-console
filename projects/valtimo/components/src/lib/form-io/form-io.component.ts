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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormioSubmission, ValtimoFormioOptions } from '@valtimo/contract';
import { UserProviderService } from '@valtimo/security';
import { Formio, FormioForm } from 'angular-formio';
import { FormioRefreshValue } from 'angular-formio/formio.common';
import jwt_decode from 'jwt-decode';
import { KeycloakService } from 'keycloak-angular';
import { NGXLogger } from 'ngx-logger';
import { from, Subscription, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'valtimo-form-io',
  templateUrl: './form-io.component.html',
  styleUrls: ['./form-io.component.css']
})
export class FormioComponent implements OnInit, OnChanges, OnDestroy {
  @Input() form: any;
  @Input() options: ValtimoFormioOptions;
  @Output() submit: EventEmitter<any> = new EventEmitter();
  refreshForm: EventEmitter<FormioRefreshValue> = new EventEmitter();
  formDefinition: FormioForm;
  public errors: string[] = [];

  private tokenRefreshTimerSubscription: Subscription;

  constructor(private userProviderService: UserProviderService, private keycloakService: KeycloakService, private logger: NGXLogger) {}

  ngOnInit() {
    this.formDefinition = this.form;
    this.errors = [];

    this.userProviderService.getToken().then((token: string) => {
      this.setToken(token);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.formDefinition = changes.form.currentValue;
    this.reloadForm();
  }

  ngOnDestroy(): void {
    if (this.tokenRefreshTimerSubscription) {
      this.tokenRefreshTimerSubscription.unsubscribe();
    }
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

  private setToken(token: string): void {
    localStorage.setItem('formioToken', token);
    Formio.setToken(token);
    this.setTimerForTokenRefresh(token);

    this.logger.debug('New token set for form.io.');
  }

  private setTimerForTokenRefresh(token: string): void {
    const tokenExp = (jwt_decode(token) as any).exp * 1000;
    const expiryTime = tokenExp - Date.now() - 1000;
    this.tokenRefreshTimerSubscription = timer(expiryTime).subscribe(() => {
      this.refreshToken();
    });

    this.logger.debug(`Timer for form.io token refresh set for: ${expiryTime}ms.`);
  }

  private refreshToken(): void {
    from(this.keycloakService.updateToken(-1))
      .pipe(
        switchMap(() => this.userProviderService.getToken()),
        take(1)
      )
      .subscribe((token) => {
        this.setToken(token);
      });
  }
}
