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
function verifyBranch(flag: "C" | "Z" | "N" | "V") {
  const operationSize = 2;

  // Branch on set, flag set to false.
  cpu.Flags[flag] = false;
  expect(cpu.Execute(2, memory)).toBe(2);
  verifyProgramCounter(operationSize); // This is enough to confirm the operation size of the branch instruction is correct

  // Branch on set, flag set to true.
  // Will branch and run LDA
  cpu.Flags[flag] = true;
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.A).toBe(0x42);

  // Branch on clear, flag set to true.
  cpu.Flags[flag] = true;
  expect(cpu.Execute(2, memory)).toBe(2);

  // Branch on clear, flag set to false.
  // Will branch and run LDX
  cpu.Flags[flag] = false;
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.X).toBe(0x42);
}

test.only("Verify BEQ and BNE", () => {
  initialize("BEQ_BNE");
  verifyBranch("Z");
});
