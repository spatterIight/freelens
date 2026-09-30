/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface KubeconfigContext {
  kubeconfigPath: string;
  contextName: string;
}

export const openKubeconfigPathSchema = "/kubeconfig";

export const getOpenKubeconfigUrl = ({ kubeconfigPath, contextName }: KubeconfigContext): string => {
  const url = new URL(`freelens://app${openKubeconfigPathSchema}`);

  url.searchParams.set("path", kubeconfigPath);
  url.searchParams.set("context", contextName);

  return url.toString();
};
