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

// Verifies the register increment operation on the specified register.
function verifyRegisterIncrement(register: "X" | "Y") {
  const operationSize = 1;

  // Increment from zero, ensure zero flag clears
  cpu.Registers[register] = 0b00000000;
  cpu.Flags.Z = true;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0b00000001);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  verifyProgramCounter(operationSize);

  // Increment from 255, ensure it wraps to zero
  cpu.Registers[register] = 0xff;
  cpu.Flags.Z = false;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  verifyProgramCounter(operationSize);

  // Increment from 0b01111111, ensure it sets negative flag
  cpu.Registers[register] = 0b01111111;
  cpu.Flags.Z = false;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0b10000000);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  verifyProgramCounter(operationSize);
}

// Verifies the register increment operation on memory.
function verifyMemoryIncrement() {
  // Zero page increment from zero, ensure zero flag clears
  cpu.Flags.Z = true;
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(memory.readByte(0x00)).toBe(0b00000001);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);

  // Zero page increment from 255, ensure it wraps to zero
  cpu.Flags.Z = false;
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(memory.readByte(0x00 + 0x01)).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);

  // Zero page increment from 0b01111111, ensure it sets negative flag
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(memory.readByte(0x00 + 0x02)).toBe(0b10000000);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
}

test("Verify INX and INY", () => {
  initialize("INX_INY");
  verifyRegisterIncrement("X");
  verifyRegisterIncrement("Y");
});

test("Verify INC", () => {
  initialize("INC");
  verifyMemoryIncrement();
});
