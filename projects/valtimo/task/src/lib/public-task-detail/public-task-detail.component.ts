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

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormioForm} from 'angular-formio';
import {PublicTaskService} from '../public-task.service';

@Component({
  selector: 'valtimo-public-task-detail',
  templateUrl: './public-task-detail.component.html',
  styleUrls: ['./public-task-detail.component.scss']
})
export class PublicTaskDetailComponent implements OnInit {
  public token: string;
  public form: FormioForm;
  public formIoOptions = {
    disableAlerts: true
  };
  public alertMessage: string | null = null;
  public alertType: string | null = null;
  public showTask = true;

  constructor(
    private publicTaskService: PublicTaskService,
    private route: ActivatedRoute
  ) {
    const snapshot = this.route.snapshot.paramMap;
    this.token = snapshot.get('token') || '';
  }

  ngOnInit() {
    this.getPublicTaskForm(this.token);
  }

  private alert(type: string, message: string, showTask: boolean) {
    this.alertMessage = message;
    this.alertType = type;
    this.showTask = showTask;
  }

  public getPublicTaskForm(token: string) {
    this.publicTaskService.getPublicTaskForm(token).subscribe(form => {
      this.form = form;
    }, () => {
      this.alert('error', 'Public task does not exist or is already completed', false);
    });
  }

  public submit(data: any) {
    this.publicTaskService.completePublicTaskForm(this.token, data).subscribe(() => {
      this.alert('success', 'Successfully completed public task', false);
    }, () => {
      this.alert('error', 'Failed to complete public task', true);
    });
  }
}
