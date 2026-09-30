/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "node:path";
import readFileInjectable from "../../../common/fs/read-file.injectable";
import kubeconfigSyncManagerInjectable from "../../../main/catalog-sources/kubeconfig-sync/manager.injectable";
import electronAppInjectable from "../../../main/electron-app/electron-app.injectable";
import requestSingleInstanceLockInjectable from "../../../main/electron-app/features/request-single-instance-lock.injectable";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import openDeepLinkInjectable from "../../../main/protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import commandLineArgumentsInjectable from "../../../main/utils/command-line-arguments.injectable";
import { getOpenKubeconfigUrl } from "../common/open-kubeconfig-url";
import kubeconfigArgumentInjectable from "./kubeconfig-argument.injectable";
import openKubeconfigInjectable from "./open-kubeconfig.injectable";
import openKubeconfigOfSecondInstanceInjectable from "./open-kubeconfig-of-second-instance.injectable";

import type { DiContainer } from "@ogre-tools/injectable";
import type { Mock } from "vitest";

import type { KubeconfigSyncManager } from "../../../main/catalog-sources/kubeconfig-sync/manager";

const kubeconfig = JSON.stringify({
  clusters: [{ name: "some-cluster", cluster: { server: "https://1.2.3.4" } }],
  users: [{ name: "some-user" }],
  contexts: [{ name: "some-context", context: { cluster: "some-cluster", user: "some-user" } }],
  "current-context": "some-context",
});

describe("kubeconfig argument", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
  });

  it.each([
    { given: ["--kubeconfig", "/some/kubeconfig"], expected: "/some/kubeconfig" },
    { given: ["--kubeconfig=/some/kubeconfig"], expected: "/some/kubeconfig" },
    { given: ["--kubeconfig", "some/kubeconfig"], expected: path.resolve("some/kubeconfig") },
    { given: ["--kubeconfig", "--hidden"], expected: undefined },
    { given: ["--kubeconfig"], expected: undefined },
    { given: ["--hidden"], expected: undefined },
  ])("given arguments $given, the kubeconfig is $expected", ({ given, expected }) => {
    di.override(commandLineArgumentsInjectable, () => ["/some/freelens", ...given]);

    expect(di.inject(kubeconfigArgumentInjectable)).toBe(expected);
  });

  describe("when opening a kubeconfig", () => {
    let readFileMock: Mock;
    let syncForSessionMock: Mock;
    let openDeepLinkMock: Mock;

    beforeEach(() => {
      readFileMock = vi.fn();
      syncForSessionMock = vi.fn();
      openDeepLinkMock = vi.fn();

      di.override(readFileInjectable, () => readFileMock);
      di.override(openDeepLinkInjectable, () => openDeepLinkMock);
      di.override(
        kubeconfigSyncManagerInjectable,
        () => ({ syncForSession: syncForSessionMock }) as Partial<KubeconfigSyncManager> as KubeconfigSyncManager,
      );
    });

    it("syncs the file and opens its current context", async () => {
      readFileMock.mockResolvedValue(kubeconfig);

      await di.inject(openKubeconfigInjectable)("/some/kubeconfig");

      expect(syncForSessionMock).toHaveBeenCalledWith("/some/kubeconfig");
      expect(openDeepLinkMock).toHaveBeenCalledWith(
        getOpenKubeconfigUrl({ kubeconfigPath: "/some/kubeconfig", contextName: "some-context" }),
      );
    });

    it("given the file cannot be read, does nothing", async () => {
      readFileMock.mockRejectedValue(new Error("some-error"));

      await di.inject(openKubeconfigInjectable)("/some/kubeconfig");

      expect(syncForSessionMock).not.toHaveBeenCalled();
      expect(openDeepLinkMock).not.toHaveBeenCalled();
    });
  });

  it("opens the kubeconfig that a second instance was started with", () => {
    const app = di.inject(electronAppInjectable);
    const openKubeconfigMock = vi.fn();
    const requestSingleInstanceLockMock = vi.spyOn(app, "requestSingleInstanceLock");

    di.override(commandLineArgumentsInjectable, () => ["/some/freelens", "--kubeconfig", "/some/kubeconfig"]);
    di.override(openKubeconfigInjectable, () => openKubeconfigMock);

    di.inject(openKubeconfigOfSecondInstanceInjectable).run();
    di.inject(requestSingleInstanceLockInjectable)();

    const [dataOfSecondInstance] = requestSingleInstanceLockMock.mock.calls[0];

    app.emit("second-instance", {}, [], "/some-directory", dataOfSecondInstance);

    expect(openKubeconfigMock).toHaveBeenCalledWith("/some/kubeconfig");
  });
});
