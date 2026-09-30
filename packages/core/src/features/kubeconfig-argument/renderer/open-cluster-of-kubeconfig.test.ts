/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { showShortInfoNotificationInjectable } from "@freelensapp/notifications";
import { runInAction } from "mobx";
import navigateToClusterViewInjectable from "../../../common/front-end-routing/routes/cluster-view/navigate-to-cluster-view.injectable";
import catalogEntityRegistryInjectable from "../../../renderer/api/catalog/entity/registry.injectable";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import { createMockClusterEntity } from "../../cluster/execute/common/testing";
import openClusterOfKubeconfigInjectable from "./open-cluster-of-kubeconfig.injectable";

import type { Mock } from "vitest";

import type { CatalogEntityRegistry } from "../../../renderer/api/catalog/entity/registry";

describe("opening the cluster of a kubeconfig", () => {
  let entityRegistry: CatalogEntityRegistry;
  let navigateToClusterViewMock: Mock;
  let showShortInfoNotificationMock: Mock;
  let opening: Promise<void>;

  beforeEach(() => {
    vi.useFakeTimers();

    const di = getDiForUnitTesting();

    navigateToClusterViewMock = vi.fn();
    showShortInfoNotificationMock = vi.fn();

    di.override(navigateToClusterViewInjectable, () => navigateToClusterViewMock);
    di.override(showShortInfoNotificationInjectable, () => showShortInfoNotificationMock);

    entityRegistry = di.inject(catalogEntityRegistryInjectable);

    opening = di.inject(openClusterOfKubeconfigInjectable)({
      kubeconfigPath: "/path/to/kubeconfig-some-cluster",
      contextName: "context-some-cluster",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the cluster when the sync brings it to the catalog", async () => {
    runInAction(() => {
      entityRegistry.updateItems([
        createMockClusterEntity("some-other-cluster", "disconnected"),
        createMockClusterEntity("some-cluster", "disconnected"),
      ]);
    });

    await opening;

    expect(navigateToClusterViewMock).toHaveBeenCalledWith("some-cluster");
  });

  it("given the cluster does not come, tells so instead", async () => {
    vi.runAllTimers();

    await opening;

    expect(navigateToClusterViewMock).not.toHaveBeenCalled();
    expect(showShortInfoNotificationMock).toHaveBeenCalled();
  });
});
