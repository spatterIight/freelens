/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { loggerInjectionToken } from "@freelensapp/logger";
import { getInjectable } from "@ogre-tools/injectable";
import readFileInjectable from "../../../common/fs/read-file.injectable";
import { loadConfigFromString } from "../../../common/kube-helpers";
import kubeconfigSyncManagerInjectable from "../../../main/catalog-sources/kubeconfig-sync/manager.injectable";
import openDeepLinkInjectable from "../../../main/protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import { getOpenKubeconfigUrl } from "../common/open-kubeconfig-url";

export type OpenKubeconfig = (kubeconfigPath: string) => Promise<void>;

/**
 * Adds the clusters of a kubeconfig to the catalog for this session, and opens
 * the cluster of its current context.
 */
const openKubeconfigInjectable = getInjectable({
  id: "open-kubeconfig",

  instantiate: (di): OpenKubeconfig => {
    const kubeconfigSyncManager = di.inject(kubeconfigSyncManagerInjectable);
    const readFile = di.inject(readFileInjectable);
    const openDeepLink = di.inject(openDeepLinkInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async (kubeconfigPath) => {
      try {
        const { config } = loadConfigFromString(await readFile(kubeconfigPath));

        kubeconfigSyncManager.syncForSession(kubeconfigPath);

        await openDeepLink(getOpenKubeconfigUrl({ kubeconfigPath, contextName: config.currentContext }));
      } catch (error) {
        logger.error(`[KUBECONFIG-ARGUMENT]: failed to open ${kubeconfigPath}: ${error}`);
      }
    };
  },
});

export default openKubeconfigInjectable;
