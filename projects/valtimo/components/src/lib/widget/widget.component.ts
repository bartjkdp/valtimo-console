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

import {Component, Input, OnInit} from '@angular/core';

/**
 * Component used to display a widget element
 */
@Component({
  selector: 'valtimo-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.css']
})
export class WidgetComponent implements OnInit {
  @Input() type?: string;
  @Input() name?: string;
  @Input() icon?: string;
  @Input() contrast?: string;
  @Input() divider?: string;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() collapseAble?: string;
  @Input() collapse?: string;
  @Input() additionalClasses?: string;
  public cardClassName: string;
  public contrastClass: string;
  public dividerClass: string;
  public isCollapsed: boolean;

  constructor() {
  }

  ngOnInit() {
    this.cardClassName = 'card-full-default';
    if (this.type) {
      this.cardClassName = 'card-full-' + this.type;
    }
    if (this.additionalClasses) {
      this.cardClassName = this.cardClassName + ' ' + this.additionalClasses;
    }
    if (this.contrast) {
      this.contrastClass = 'card-header-contrast';
    }
    if (this.divider) {
      this.dividerClass = 'card-header-divider';
    }
    if (this.collapseAble && this.collapse === 'hide') {
      this.isCollapsed = false;
    } else {
      this.isCollapsed = true;
    }
  }

  public toggleContent() {
    if (this.collapseAble) {
      return this.isCollapsed = !this.isCollapsed;
    }
    return true;
  }
}
