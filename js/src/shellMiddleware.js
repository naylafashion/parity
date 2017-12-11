// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import * as mobx from 'mobx';
import flatten from 'lodash.flatten';

import { sha3 } from '@parity/api/lib/util/sha3';
import { isHex } from '@parity/api/lib/util/types';
import VisibleStore from '@parity/shared/lib/mobx/dappsStore';

import RequestStore from './DappRequests/store';
import methodGroups from './DappRequests/methodGroups';

export default function execute (appId, method, params, callback) {
  const visibleStore = VisibleStore.get();
  const requestStore = RequestStore.get();

  switch (method) {
    case 'shell_getApps':
      const [displayAll] = params;

      callback(
        null,
        displayAll
          ? visibleStore.allApps.slice().map(mobx.toJS)
          : visibleStore.visibleApps.slice().map(mobx.toJS)
      );
      return true;

    case 'shell_getFilteredMethods':
      callback(
        null,
        flatten(Object.keys(methodGroups).map(key => methodGroups[key].methods))
      );
      return true;

    case 'shell_getMethodGroups':
      callback(
        null,
        methodGroups
      );
      return true;

    case 'shell_getMethodPermissions':
      callback(null, mobx.toJS(requestStore.permissions));
      return true;

    case 'shell_loadApp':
      const [_loadId, loadParams] = params;
      const loadId = isHex(_loadId) ? _loadId : sha3(_loadId);
      const loadUrl = `/${loadId}/${loadParams || ''}`;

      window.location.hash = loadUrl;

      callback(null, true);
      return true;

    case 'shell_requestNewToken':
      callback(null, requestStore.createToken(appId));
      return true;

    case 'shell_setAppVisibility':
      const [changeId, visibility] = params;

      callback(
        null,
        visibility
          ? visibleStore.showApp(changeId)
          : visibleStore.hideApp(changeId)
      );
      return true;

    case 'shell_setMethodPermissions':
      const [permissions] = params;

      callback(null, requestStore.setPermissions(permissions));
      return true;

    default:
      return false;
  }
}
