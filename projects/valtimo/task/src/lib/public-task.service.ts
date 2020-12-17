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

import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FormioForm} from 'angular-formio';
import {FormioSubmission} from '@valtimo/contract';
import {ConfigService} from '@valtimo/config';

@Injectable({providedIn: 'root'})
export class PublicTaskService {
  private readonly valtimoEndpointUri: string;
  private http: HttpClient;

  constructor(
    private httpBackend: HttpBackend,
    configService: ConfigService
  ) {
    this.http = new HttpClient(httpBackend);
    this.valtimoEndpointUri = configService.config.valtimoApi.endpointUri;
  }

  getPublicTaskForm(token: string): Observable<FormioForm> {
    return this.http.get<FormioForm>(`${this.valtimoEndpointUri}public/form-association/form-definition`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    });
  }

  completePublicTaskForm(token: string, submission: FormioSubmission): Observable<any> {
    return this.http.post(
      `${this.valtimoEndpointUri}public/form-association/form-definition/submission`,
      submission.data,
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      });
  }

}
