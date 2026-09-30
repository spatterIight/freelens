/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { beforeMainFrameStartsSecondInjectionToken } from "../../../renderer/before-frame-starts/tokens";
import lensProtocolRouterRendererInjectable from "../../../renderer/protocol-handler/lens-protocol-router-renderer/lens-protocol-router-renderer.injectable";
import { openKubeconfigPathSchema } from "../common/open-kubeconfig-url";
import openClusterOfKubeconfigInjectable from "./open-cluster-of-kubeconfig.injectable";

const handleOpenKubeconfigUrlInjectable = getInjectable({
  id: "handle-open-kubeconfig-url",

  instantiate: (di) => ({
    run: () => {
      const lensProtocolRouterRenderer = di.inject(lensProtocolRouterRendererInjectable);
      const openClusterOfKubeconfig = di.inject(openClusterOfKubeconfigInjectable);

      lensProtocolRouterRenderer.addInternalHandler(openKubeconfigPathSchema, ({ search: { path, context } }) => {
        if (path && context) {
          void openClusterOfKubeconfig({ kubeconfigPath: path, contextName: context });
        }
      });
    },
  }),

  injectionToken: beforeMainFrameStartsSecondInjectionToken,
});

export default handleOpenKubeconfigUrlInjectable;
