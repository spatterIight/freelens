/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import kubeconfigArgumentInjectable from "../../../features/kubeconfig-argument/main/kubeconfig-argument.injectable";
import electronAppInjectable from "../electron-app.injectable";

import type { SingleInstanceLockData } from "../../../features/kubeconfig-argument/main/kubeconfig-argument.injectable";

const requestSingleInstanceLockInjectable = getInjectable({
  id: "request-single-instance-lock",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const kubeconfigArgument = di.inject(kubeconfigArgumentInjectable);

    // The running instance gets the arguments of this one reordered, with
    // `--kubeconfig` separated from its value, so the path is sent as data.
    const data: SingleInstanceLockData = { kubeconfigArgument };

    return () => app.requestSingleInstanceLock(data);
  },
});

export default requestSingleInstanceLockInjectable;
