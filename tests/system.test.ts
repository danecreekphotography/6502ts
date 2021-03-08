/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();

function verifyNOP(testCaseNumber: string): void {
  const operationSize = 1;
  let expectedPCLocation = CODE_LOCATION;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  const previousRegisters = cpu.Registers;
  const previousFlags = cpu.Flags.Status;

  // Run three NOP commands
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(cpu.Registers.A).toBe(previousRegisters.A);
  expect(cpu.Registers.X).toBe(previousRegisters.X);
  expect(cpu.Registers.Y).toBe(previousRegisters.Y);
  expect(cpu.Registers.SP).toBe(previousRegisters.SP);
  expect(cpu.Flags.Status).toBe(previousFlags);
  expectedPCLocation += operationSize * 3;
  expect(cpu.PC).toBe(expectedPCLocation);
}

test("0400 - Verify NOP", () => {
  verifyNOP("0400");
});
