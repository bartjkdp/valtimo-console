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
import {MenuConfig, MenuItem} from '@valtimo/contract';
import {NGXLogger} from 'ngx-logger';
import {ConfigService} from '@valtimo/config';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menuItems: MenuItem[] = [];
  private menuConfig: MenuConfig;

  constructor(
    configService: ConfigService,
    private logger: NGXLogger
  ) {
    this.menuConfig = configService.config.menu;
  }

  init(): void {
    this.menuConfig.menuItems.forEach((menuItem: MenuItem) => {
      menuItem.show = true;
      this.menuItems.push(menuItem);
    });
    this.logger.debug('Menu initialized');
  }

  getMenuItems(): MenuItem[] {
    return this.menuItems.sort((a, b) => {
      return a.sequence - b.sequence;
    });
  }

}
