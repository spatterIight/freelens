/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { afterApplicationIsLoadedInjectionToken } from "@freelensapp/application";
import { getInjectable } from "@ogre-tools/injectable";
import showInitialWindowInjectable from "../../../main/start-main-application/runnables/show-initial-window.injectable";
import kubeconfigArgumentInjectable from "./kubeconfig-argument.injectable";
import openKubeconfigInjectable from "./open-kubeconfig.injectable";

const openKubeconfigOfFirstInstanceInjectable = getInjectable({
  id: "open-kubeconfig-of-first-instance",

  instantiate: (di) => ({
    run: async () => {
      const kubeconfigArgument = di.inject(kubeconfigArgumentInjectable);
      const openKubeconfig = di.inject(openKubeconfigInjectable);

      if (kubeconfigArgument) {
        await openKubeconfig(kubeconfigArgument);
      }
    },
    runAfter: showInitialWindowInjectable,
  }),

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default openKubeconfigOfFirstInstanceInjectable;
