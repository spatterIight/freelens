/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { showShortInfoNotificationInjectable } from "@freelensapp/notifications";
import { getInjectable } from "@ogre-tools/injectable";
import { when } from "mobx";
import { isKubernetesCluster } from "../../../common/catalog-entities/kubernetes-cluster";
import navigateToClusterViewInjectable from "../../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import catalogEntityRegistryInjectable from "../../../renderer/api/catalog/entity/registry.injectable";

import type { KubeconfigContext } from "../common/open-kubeconfig-url";

export type OpenClusterOfKubeconfig = (context: KubeconfigContext) => Promise<void>;

const syncTimeout = 15_000;

/**
 * Opens the cluster of a kubeconfig context once the kubeconfig sync has
 * brought it to the catalog.
 */
const openClusterOfKubeconfigInjectable = getInjectable({
  id: "open-cluster-of-kubeconfig",

  instantiate: (di): OpenClusterOfKubeconfig => {
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);
    const navigateToClusterView = di.inject(navigateToClusterViewInjectable);
    const showShortInfoNotification = di.inject(showShortInfoNotificationInjectable);

    return async ({ kubeconfigPath, contextName }) => {
      const findCluster = () =>
        entityRegistry.items
          .get()
          .filter(isKubernetesCluster)
          .find(({ spec }) => spec.kubeconfigPath === kubeconfigPath && spec.kubeconfigContext === contextName);

      try {
        await when(() => findCluster() !== undefined, { timeout: syncTimeout });
      } catch {
        return void showShortInfoNotification(
          <p>
            {"No cluster for context "}
            <code>{contextName}</code>
            {" of "}
            <code>{kubeconfigPath}</code>.
          </p>,
        );
      }

      const cluster = findCluster();

      if (cluster) {
        navigateToClusterView(cluster.getId());
      }
    };
  },
});

export default openClusterOfKubeconfigInjectable;
