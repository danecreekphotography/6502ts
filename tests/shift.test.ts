/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Memory from "../src/memory";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();
let memory: Memory;
let expectedPCLocation: number;

/**
 * Creates a new memory instance initialized with the code from the test case
 * and resets the CPU for test execution. Also sets the expected start location
 * for the program counter to the starting code location in memory.
 * @param testCase The test case binary to load.
 */
function initialize(testCase: string) {
  memory = createMemoryFromTestRom(testCase);
  cpu.Initialize(memory);
  expectedPCLocation = CODE_LOCATION;
}

/**
 * Increments the expected program counter location by the size of the operation
 * then confirms the CPU's program counter is in fact in that location.
 * @param operationSize The number of bytes the operation takes to execute.
 */
function verifyProgramCounter(operationSize: number) {
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
}

// Verifies a pair of branch instructions works correctly. Always tests
// branching on flag set first, followed by branching on flag clear.
function verifyAsl() {
  const operationSize = 1;

  // Test shifts on A register
  cpu.Registers.A = 0b00100000;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.A).toBe(0b01000000);
  expect(cpu.Flags.C).toBe(false);
  verifyProgramCounter(operationSize); // This is enough to confirm the operation size of the branch instruction is correct

  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.A).toBe(0b10000000);
  expect(cpu.Flags.C).toBe(false);

  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.A).toBe(0b00000000);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.C).toBe(true);

  // Test a shift on zero page
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(memory.readByte(0x00)).toBe(0b01000000);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.C).toBe(false);

  // Test a shift on zero page plus X
  cpu.Registers.X = 0x01;
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(memory.readByte(0x00)).toBe(0b01000000);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.C).toBe(false);

  // Test a shift on absolute memory location
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(memory.readByte(0x3000)).toBe(0b01000000);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.C).toBe(false);

  // Test a shift on absolute memory location plus X
  cpu.Registers.X = 0x01;
  expect(cpu.Execute(7, memory)).toBe(7);
  expect(memory.readByte(0x3001)).toBe(0b01000000);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.C).toBe(false);
}

test("Verify ASL", () => {
  initialize("ASL");
  verifyAsl();
});
