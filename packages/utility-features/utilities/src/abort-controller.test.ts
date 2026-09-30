/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isAbortError, WrappedAbortController } from "./abort-controller";

describe("WrappedAbortController", () => {
  it("is aborted when its parent was aborted before it was created", () => {
    const parent = new AbortController();

    parent.abort();

    expect(new WrappedAbortController(parent).signal.aborted).toBe(true);
  });
});

describe("isAbortError", () => {
  it("matches a DOMException named AbortError", () => {
    expect(isAbortError(new DOMException("The operation was aborted.", "AbortError"))).toBe(true);
  });

  it("matches the AbortSignal.reason of an aborted controller", () => {
    const controller = new AbortController();

    controller.abort();

    expect(isAbortError(controller.signal.reason)).toBe(true);
  });

  it("matches an error-like object named AbortError", () => {
    expect(isAbortError({ name: "AbortError" })).toBe(true);
  });

  it("matches the kube watch aborted shape", () => {
    expect(isAbortError({ type: "aborted" })).toBe(true);
  });

  it("does not match a genuine error", () => {
    expect(isAbortError(new Error("boom"))).toBe(false);
  });

  it("does not match non-error values", () => {
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError("aborted")).toBe(false);
  });
});
