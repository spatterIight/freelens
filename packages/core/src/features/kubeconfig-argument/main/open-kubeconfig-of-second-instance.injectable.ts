/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { onLoadOfApplicationInjectionToken } from "@freelensapp/application";
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../../../main/electron-app/electron-app.injectable";
import openKubeconfigInjectable from "./open-kubeconfig.injectable";

import type { SingleInstanceLockData } from "./kubeconfig-argument.injectable";

const openKubeconfigOfSecondInstanceInjectable = getInjectable({
  id: "open-kubeconfig-of-second-instance",

  instantiate: (di) => ({
    run: () => {
      const app = di.inject(electronAppInjectable);
      const openKubeconfig = di.inject(openKubeconfigInjectable);

      app.on("second-instance", (_event, _commandLineArguments, _workingDirectory, additionalData) => {
        const { kubeconfigArgument } = (additionalData ?? {}) as SingleInstanceLockData;

        if (kubeconfigArgument) {
          void openKubeconfig(kubeconfigArgument);
        }
      });
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default openKubeconfigOfSecondInstanceInjectable;
