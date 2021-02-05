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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DropdownItem, User, ValtimoUserIdentity } from '@valtimo/contract';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TaskService } from '../task.service';

@Component({
  selector: 'valtimo-assign-user-to-task',
  templateUrl: './assign-user-to-task.component.html',
  styleUrls: ['./assign-user-to-task.component.scss']
})
export class AssignUserToTaskComponent implements OnInit, OnChanges {
  @Input() taskId: string;
  @Input() assigneeId: string;
  @Output() assignmentOfTaskChanged = new EventEmitter();

  readonly textContent$ = combineLatest([
    this.translateService.stream('assignTask.header'),
    this.translateService.stream('assignTask.placeholder'),
    this.translateService.stream('assignTask.remove'),
    this.translateService.stream('assignTask.save'),
    this.translateService.stream('assignTask.assignedTo'),
    this.translateService.stream('interface.typeToSearch'),
    this.translateService.stream('interface.noSearchResults')
  ]).pipe(
    map(([header, placeholder, remove, save, assignedTo, searchText, noResults]) => ({
      header,
      placeholder,
      remove,
      save,
      assignedTo,
      searchText,
      noResults
    }))
  );

  candidateUsersForTask$: Observable<ValtimoUserIdentity[]>;

  disabled$ = new BehaviorSubject<boolean>(true);

  assignedIdOnServer$ = new BehaviorSubject<string>(null);

  userIdToAssign: string = null;

  constructor(private taskService: TaskService, private readonly translateService: TranslateService) {}

  ngOnInit(): void {
    this.candidateUsersForTask$ = this.taskService.getCandidateUsers(this.taskId).pipe(
      tap(() => {
        if (this.assigneeId) {
          this.assignedIdOnServer$.next(this.assigneeId);
          this.userIdToAssign = this.assigneeId;
        }
        this.enable();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const assigneeId = changes.assigneeId;

    if (assigneeId) {
      const currentUserId = assigneeId.currentValue;
      this.assignedIdOnServer$.next(currentUserId || null);
      this.userIdToAssign = currentUserId || null;
    } else {
      this.clear();
    }
  }

  assignTask(userId: string): void {
    this.disable();

    this.taskService
      .assignTask(this.taskId, userId)
      .pipe(
        tap(() => {
          this.userIdToAssign = userId;
          this.assignedIdOnServer$.next(this.userIdToAssign);
          this.emitChange();
          this.enable();
        })
      )
      .subscribe();
  }

  unassignTask(): void {
    this.disable();

    this.taskService
      .unassignTask(this.taskId)
      .pipe(
        tap(() => {
          this.clear();
          this.emitChange();
          this.enable();
        })
      )
      .subscribe();
  }

  getAssignedUserName(users: User[], id: string): string {
    return users && id ? users.find((user) => user.id === id).fullName : '';
  }

  mapUsersForDropdown(users: User[]): DropdownItem[] {
    return (
      users &&
      users
        .map((user) => ({ ...user, lastName: user.lastName.split(' ').splice(-1)[0] }))
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .map((user) => ({ text: user.fullName, id: user.id }))
    );
  }

  private clear(): void {
    this.assignedIdOnServer$.next(null);
    this.userIdToAssign = null;
  }

  private emitChange(): void {
    this.assignmentOfTaskChanged.emit();
  }

  private enable(): void {
    this.disabled$.next(false);
  }

  private disable(): void {
    this.disabled$.next(true);
  }
}
