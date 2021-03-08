/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import { FlagMask } from "../src/flags";
import Memory from "../src/memory";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();
let memory: Memory;

/**
 * Initializes a test with memory loaded from a file.
 * @param testCaseNumber The test case to load from binary
 */
function initialize(testCaseNumber: string) {
  memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Set all the flags
  cpu.Flags.Status = 0b11111111;
}

/**
 * Tests the zero and negative flag cases for logical and. Any registers
 * that need to be configured for the test case's addressing mode should be
 * set before calling this function.
 * @param operationSize The number of bytes the operation takes
 * @param expectedCycles The expected number of clock cycles to run the operation
 */
function verifyZeroAndNegative(operationSize: number, expectedCycles: number) {
  let expectedPCLocation = CODE_LOCATION;

  // Test negative
  cpu.Registers.A = FlagMask.N;
  expect(cpu.Execute(expectedCycles, memory)).toBe(expectedCycles);
  expect(cpu.Flags.Z).toBe(false); // Zero flag should get cleared
  expect(cpu.Flags.N).toBe(true); // Negative flag should stay set
  expect(cpu.Flags.Status).toBe(0b11111101); // Everything else should be set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);

  // Test zero
  cpu.Registers.A = FlagMask.B; // Doesn't really matter what this is, will result in 0 in A register.
  expect(cpu.Execute(expectedCycles, memory)).toBe(expectedCycles);
  expect(cpu.Flags.Z).toBe(true); // Zero flag should be set
  expect(cpu.Flags.N).toBe(false); // Negative flag should clear
  expect(cpu.Flags.Status).toBe(0b01111111); // Everything else should stay set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
}

test("0300 - AND immediate", () => {
  initialize("0300");
  verifyZeroAndNegative(2, 2);
});

test("0301 - AND zero page", () => {
  initialize("0301");
  verifyZeroAndNegative(2, 3);
});

test("0302 - AND zero page plus X", () => {
  initialize("0302");
  cpu.Registers.X = 0x01;
  verifyZeroAndNegative(2, 4);
});

test("0303 - AND absolute", () => {
  initialize("0303");
  verifyZeroAndNegative(3, 4);
});

test("0304 - AND absolute plus X", () => {
  initialize("0304");
  cpu.Registers.X = 0x01;
  verifyZeroAndNegative(3, 4);
});

test("0305 - AND absolute plus Y", () => {
  initialize("0305");
  cpu.Registers.Y = 0x01;
  verifyZeroAndNegative(3, 4);
});
