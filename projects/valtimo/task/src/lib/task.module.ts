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

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpLoaderFactory} from '@valtimo/contract';
import {TaskRoutingModule} from './task-routing.module';
import {TaskListComponent} from './task-list/task-list.component';
import {CamundaFormModule, FormIoModule, ListModule, ModalModule, PageHeaderModule, WidgetModule} from '@valtimo/components';
import {ToastrModule} from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TaskDetailModalComponent} from './task-detail-modal/task-detail-modal.component';
import {PublicTaskDetailComponent} from './public-task-detail/public-task-detail.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';

@NgModule({
  declarations: [TaskListComponent, TaskDetailModalComponent, PublicTaskDetailComponent],
  imports: [
    CommonModule,
    TaskRoutingModule,
    ListModule,
    PageHeaderModule,
    WidgetModule,
    CamundaFormModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-full-width',
      preventDuplicates: true
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule,
    FormIoModule,
    ModalModule
  ],
  exports: [TaskListComponent, TaskDetailModalComponent]
})
export class TaskModule {

}
