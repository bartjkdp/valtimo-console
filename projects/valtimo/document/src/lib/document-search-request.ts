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

import {HttpParams} from '@angular/common/http';
import {SortState} from '@valtimo/contract';

export interface DocumentSearchRequest {
  definitionName: string;
  page: number;
  size: number;
  sequence?: number;
  createdBy?: string;
  searchCriteria?: string;
  sort?: SortState;

  asHttpParams(): HttpParams;
  setPage(page: number): void;
  getSortString(sort: SortState): string;
}

export class DocumentSearchRequestImpl implements DocumentSearchRequest {
  definitionName: string;
  page: number;
  size: number;
  sequence?: number;
  createdBy?: string;
  searchCriteria?: string;
  sort?: SortState;

  constructor(
    definitionName: string,
    page: number,
    size: number,
    sequence?: number,
    createdBy?: string,
    searchCriteria?: string,
    sort?: SortState
  ) {
    this.definitionName = definitionName;
    this.page = page;
    this.size = size;
    this.sequence = sequence;
    this.createdBy = createdBy;
    this.searchCriteria = searchCriteria;
    this.sort = sort;
  }

  asHttpParams(): HttpParams {
    let params = new HttpParams()
      .set('definitionName', this.definitionName)
      .set('page', this.page.toString())
      .set('size', this.size.toString());
    if (this.sort) {
      params = params.set('sort', this.getSortString(this.sort));
    }
    if (this.sequence) {
      params = params.set('sequence', this.sequence.toString());
    }
    if (this.createdBy) {
      params = params.set('createdBy', this.createdBy);
    }
    if (this.searchCriteria) {
      params = params.set('searchCriteria', this.searchCriteria.trim());
    }
    return params;
  }

  setPage(page: number): void {
    this.page = page;
  }

  getSortString(sort: SortState): string {
    return `${sort.state.name},${sort.state.direction}`;
  }
}
