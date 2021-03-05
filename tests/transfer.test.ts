/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Registers from "../src/registers";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();

function verifyRegisterTransfer(
  testCaseNumber: string,
  sourceRegister: keyof Registers,
  destinationRegister: keyof Registers,
): void {
  const operationSize = 1;
  let expectedPCLocation = CODE_LOCATION;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Positive number case
  cpu.Registers[sourceRegister] = 0x42;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[destinationRegister]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);

  // Zero number case
  cpu.Registers[sourceRegister] = 0x00;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[destinationRegister]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);

  // Negative number case
  cpu.Registers[sourceRegister] = 0b10010101;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[destinationRegister]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
}

test("0200 - Verify TAX", () => {
  verifyRegisterTransfer("0200", "A", "X");
});

test("0201 - Verify TAY", () => {
  verifyRegisterTransfer("0201", "A", "Y");
});

test("0202 - Verify TXA", () => {
  verifyRegisterTransfer("0202", "X", "A");
});

test("0203 - Verify TYA", () => {
  verifyRegisterTransfer("0203", "Y", "A");
});
