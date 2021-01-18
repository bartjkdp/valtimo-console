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

import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { MenuItem } from '@valtimo/contract';
import { DocumentService } from '@valtimo/document';
import { UserProviderService } from '@valtimo/security';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { MenuService } from './menu.service';

@Component({
  selector: 'valtimo-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  public menuItems: MenuItem[];
  private routerSubscription: Subscription;

  constructor(
    private menuService: MenuService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private documentService: DocumentService,
    private userProviderService: UserProviderService,
    private logger: NGXLogger
  ) {
  }

  ngOnInit(): void {
    this.openRouterSubscription();
    this.menuItems = this.menuService.getMenuItems();
    this.appendDossierSubMenuItems();
    this.applyMenuRoleSecurity();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  private openRouterSubscription(): void {
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.closeSubMenu();
      }
    });
  }

  private applyMenuRoleSecurity(): void {
    this.userProviderService.getUserSubject().subscribe(user => {
      if (user.roles != null) {
        this.logger.debug('applyMenuRoleSecurity');
        const userRoles = user.roles;
        this.menuItems.forEach((menuItem: MenuItem) => {
          const access = this.determineRoleAccess(menuItem, userRoles);
          this.logger.debug('Menu: check role access', menuItem.roles, access);
          if (menuItem.show !== access) {
            this.logger.debug('Menu: Change access', menuItem, access);
            menuItem.show = access;
          }
        });
      }
    });
  }

  private determineRoleAccess(menuItem: MenuItem, roles: string[]): boolean {
    if (!menuItem.roles) {
      return true;
    } else if (menuItem.roles.some(role => roles.includes(role))) {
      return true;
    } else {
      return false;
    }
  }

  private appendDossierSubMenuItems(): void {
    this.logger.debug('appendDossierSubMenuItems');
    this.documentService.getAllDefinitions().subscribe(definitions => {
      const dossierMenuItems: MenuItem[] = definitions.content
        .map((definition, index) => ({
          link: ['/dossiers/' + definition.id.name],
          title: definition.schema.title,
          iconClass: 'icon mdi mdi-dot-circle',
          sequence: index,
          show: true
        } as MenuItem)
        );
      this.logger.debug('found dossierMenuItems', dossierMenuItems);
      const menuItemIndex = this.menuItems.findIndex(({ title }) => title === 'Dossiers');
      if (menuItemIndex > 0) {
        const dossierMenu = this.menuItems[menuItemIndex];
        this.logger.debug('updating dossierMenu', dossierMenu);
        dossierMenu.children = dossierMenu.children.concat(dossierMenuItems);
        this.menuItems[menuItemIndex] = dossierMenu;
      }
      this.logger.debug('appendDossierSubMenuItems finished');
    });
  }

  public closeSubMenu() {
    const visibleSubMenuElm = this.elRef.nativeElement.querySelector('.sub-menu.visible');
    if (visibleSubMenuElm) {
      this.renderer.removeClass(visibleSubMenuElm, 'visible');
      const topLevelMenuItem = this.elRef.nativeElement.querySelector('li.parent.open');
      if (topLevelMenuItem) {
        this.renderer.removeClass(topLevelMenuItem, 'open');
      }
    }
  }

}
