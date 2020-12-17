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

import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {TaskService} from '../task.service';
import * as moment_ from 'moment';
import {Task, TaskList} from '@valtimo/contract';
import {NGXLogger} from 'ngx-logger';
import {TaskDetailModalComponent} from '../task-detail-modal/task-detail-modal.component';

const moment = moment_;
moment.locale(localStorage.getItem('langKey') || 'en');

@Component({
  selector: 'valtimo-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class TaskListComponent {

  @ViewChild('taskDetail') taskDetail: TaskDetailModalComponent;
  public tasks = {
    mine: new TaskList(),
    open: new TaskList(),
    all: new TaskList()
  };
  public currentTaskType = 'mine';
  public listTitle: string | null = null;
  public listDescription: string | null = null;

  public paginationClicked(page: number, type: string) {
    this.tasks[type].page = page - 1;
    this.getTasks(type);
  }

  constructor(private taskService: TaskService, private router: Router, private logger: NGXLogger) {
  }

  paginationSet() {
    this.tasks.mine.pagination.size = this.tasks.all.pagination.size = this.tasks.open.pagination.size =
      this.tasks[this.currentTaskType].pagination.size;
    this.getTasks(this.currentTaskType);
  }

  private clearPagination(type: string) {
    this.tasks[type].page = 0;
  }

  tabChange(tab) {
    this.clearPagination(this.currentTaskType);
    switch (tab.nextId) {
      case 'ngb-tab-0':
        this.getTasks('mine');
        break;
      case 'ngb-tab-1':
        this.getTasks('open');
        break;
      case 'ngb-tab-2':
        this.getTasks('all');
        break;
      default:
        this.logger.fatal('Unreachable case');
    }
  }

  showTask(task) {
    this.router.navigate(['tasks', task.id]);
  }

  getTasks(type: string) {
    let params: any;
    switch (type) {
      case 'mine':
        params = {page: this.tasks.mine.page, size: this.tasks.mine.pagination.size, filter: 'mine'};
        this.currentTaskType = 'mine';
        this.listTitle = 'My tasks';
        this.listDescription = 'Overview of all tasks assigned to you';
        break;
      case 'open':
        params = {page: this.tasks.open.page, size: this.tasks.open.pagination.size, filter: 'open'};
        this.currentTaskType = 'open';
        this.listTitle = 'Open tasks';
        this.listDescription = 'Overview of all open tasks';
        break;
      case 'all':
        params = {page: this.tasks.all.page, size: this.tasks.open.pagination.size, filter: 'all'};
        this.currentTaskType = 'all';
        this.listTitle = 'All tasks';
        this.listDescription = 'Overview of all tasks';
        break;
      default:
        this.logger.fatal('Unreachable case');
    }

    this.taskService.queryTasks(params).subscribe(
      (results: any) => {
        this.tasks[type].pagination.collectionSize = results.headers.get('x-total-count');
        this.tasks[type].tasks = <Task[]>results.body;
        this.tasks[type].tasks.map((task: Task) => {
          task.created = moment(task.created).format('DD MMM YYYY HH:mm');
          if (task.due) {
            task.due = moment(task.due).format('DD MMM YYYY HH:mm');
          }
        });
        this.tasks[type].fields = [{
          key: 'created',
          label: 'Created on'
        },
          {
            key: 'name',
            label: 'Name'
          },
          {
            key: 'assignee',
            label: 'Assignee'
          },
          {
            key: 'due',
            label: 'Due date'
          }
        ];
      });
  }

  public rowOpenTaskClick(task) {
    if (!task.endTime) {
      this.taskDetail.openTaskDetails(task);
    } else {
      return false;
    }
  }
}
