/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import { FlagMask } from "../src/flags";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();

function verifyAndImmediate(testCaseNumber: string) {
  const operationSize = 2;
  let expectedPCLocation = CODE_LOCATION;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Start by setting all the flags
  cpu.Flags.Status = 0b11111111;

  cpu.Registers.A = FlagMask.N;

  // Test negative
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Flags.Z).toBe(false); // Zero flag should get cleared
  expect(cpu.Flags.N).toBe(true); // Negative flag should stay set
  expect(cpu.Flags.Status).toBe(0b11111101); // Everything else should be set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);

  // Test zero
  cpu.Registers.A = FlagMask.B; // Doesn't really matter what this is, will result in 0 in A register.
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Flags.Z).toBe(true); // Zero flag should be set
  expect(cpu.Flags.N).toBe(false); // Negative flag should clear
  expect(cpu.Flags.Status).toBe(0b01111111); // Everything else should stay set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
}

test("0300 - AND immediate", () => {
  verifyAndImmediate("0300");
});
