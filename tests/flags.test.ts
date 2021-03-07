/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Flags, { FlagMask } from "../src/flags";

test("Verify Flags constructor", () => {
  const flags = new Flags();

  expect(flags.B).toBe(false);
  expect(flags.C).toBe(false);
  expect(flags.D).toBe(false);
  expect(flags.I).toBe(false);
  expect(flags.N).toBe(false);
  expect(flags.Unused).toBe(true);
  expect(flags.V).toBe(false);
  expect(flags.Z).toBe(false);
  expect(flags.Status).toBe(0b00100000);
});

test("Verify Status property", () => {
  const flags = new Flags();

  // New flags should always have the unused status set.
  expect(flags.Status).toBe(FlagMask.Unused);

  flags.C = true;
  expect(flags.Status).toBe(0b00100001);

  flags.Z = true;
  expect(flags.Status).toBe(0b00100011);

  flags.I = true;
  expect(flags.Status).toBe(0b00100111);

  flags.D = true;
  expect(flags.Status).toBe(0b00101111);

  flags.B = true;
  expect(flags.Status).toBe(0b00111111);

  flags.V = true;
  expect(flags.Status).toBe(0b01111111);

  flags.N = true;
  expect(flags.Status).toBe(0b11111111);
});

test("Verify set Status property", () => {
  const flags = new Flags();

  // Test each one individually
  flags.Status = 0b00000001;
  expect(flags.C).toBe(true);

  flags.Status = 0b00000010;
  expect(flags.Z).toBe(true);

  flags.Status = 0b00000100;
  expect(flags.I).toBe(true);

  flags.Status = 0b00001000;
  expect(flags.D).toBe(true);

  flags.Status = 0b00010000;
  expect(flags.B).toBe(true);

  flags.Status = 0b00100000;
  expect(flags.Unused).toBe(true);

  flags.Status = 0b01000000;
  expect(flags.V).toBe(true);

  flags.Status = 0b10000000;
  expect(flags.N).toBe(true);

  // Try all at once
  flags.Status = 0xff;
  expect(flags.C).toBe(true);
  expect(flags.Z).toBe(true);
  expect(flags.I).toBe(true);
  expect(flags.D).toBe(true);
  expect(flags.B).toBe(true);
  expect(flags.Unused).toBe(true);
  expect(flags.V).toBe(true);
  expect(flags.N).toBe(true);
});
