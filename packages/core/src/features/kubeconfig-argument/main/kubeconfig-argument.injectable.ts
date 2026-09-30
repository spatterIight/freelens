/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "node:path";
import { getInjectable } from "@ogre-tools/injectable";
import commandLineArgumentsInjectable from "../../../main/utils/command-line-arguments.injectable";

export interface SingleInstanceLockData {
  kubeconfigArgument?: string;
}

const flag = "--kubeconfig";

/**
 * The absolute path this process was given as `--kubeconfig <path>` or
 * `--kubeconfig=<path>`.
 */
const kubeconfigArgumentInjectable = getInjectable({
  id: "kubeconfig-argument",

  instantiate: (di): string | undefined => {
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);
    const index = commandLineArguments.findIndex((argument) => argument === flag || argument.startsWith(`${flag}=`));

    if (index === -1) {
      return undefined;
    }

    const argument = commandLineArguments[index];
    const value = argument === flag ? commandLineArguments[index + 1] : argument.slice(flag.length + 1);

    if (!value || value.startsWith("-")) {
      return undefined;
    }

    return path.resolve(value);
  },
});

export default kubeconfigArgumentInjectable;
