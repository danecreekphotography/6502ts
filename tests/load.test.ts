/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Memory from "../src/memory";
import Registers from "../src/registers";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();
let memory: Memory;
let expectedPCLocation: number;

/**
 * Creates a new memory instance intialized with the code from the test case
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

/**
 * Verifies that the specified register contains the positive number 0x42, that the CPU
 * flags Z and N are set appropriately, and that the program counter incremented correctly.
 * @param cpu The CPU to execute the test with.
 * @param operationSize The size of the operation in bytes.
 * @param cycles The number of cycles to execute.
 * @param register The register to verify.
 */
function verifyPositiveNumber(cpu: CPU, operationSize: number, cycles: number, register: keyof Registers) {
  expect(cpu.Execute(cycles, memory)).toBe(cycles);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  verifyProgramCounter(operationSize);
}

/**
 * Verifies that the specified register contains 0x00, that the CPU flags Z and N are set appropriately,
 * and that the program counter incremented correctly.
 * @param cpu The CPU to execute the test with.
 * @param operationSize The size of the operation in bytes.
 * @param cycles The number of cycles to execute.
 * @param register The register to verify.
 */
function verifyZeroNumber(cpu: CPU, operationSize: number, cycles: number, register: keyof Registers) {
  expect(cpu.Execute(cycles, memory)).toBe(cycles);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  verifyProgramCounter(operationSize);
}

/**
 * Verifies that the specified register contains negative number 0b10010101, that the CPU flags Z
 * and N are set appropriately, and that the program counter incremented correctly.
 * @param cpu The CPU to execute the test with.
 * @param operationSize The size of the operation in bytes.
 * @param cycles The number of cycles to execute.
 * @param register The register to verify.
 */
function verifyNegativeNumber(cpu: CPU, operationSize: number, cycles: number, register: keyof Registers) {
  expect(cpu.Execute(cycles, memory)).toBe(cycles);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  verifyProgramCounter(operationSize);
}

// Verifies load immediate works for the specified register.
function verifyLoadImmediate(register: keyof Registers) {
  const operationSize = 2;

  verifyPositiveNumber(cpu, operationSize, 2, register);
  verifyZeroNumber(cpu, operationSize, 2, register);
  verifyNegativeNumber(cpu, operationSize, 2, register);
}

// Verifies load zero page works for the specified register.
function verifyLoadZeroPage(register: keyof Registers) {
  const operationSize = 2;

  verifyPositiveNumber(cpu, operationSize, 3, register);
  verifyZeroNumber(cpu, operationSize, 3, register);
  verifyNegativeNumber(cpu, operationSize, 3, register);
}

// Verifies load zero page plus an offset from a register works for the specified
// register and offset register.
function verifyLoadZeroPagePlusRegister(register: keyof Registers, offsetRegister: keyof Registers) {
  const operationSize = 2;
  cpu.Registers[offsetRegister] = 0x01;

  verifyPositiveNumber(cpu, operationSize, 4, register);
  verifyZeroNumber(cpu, operationSize, 4, register);
  verifyNegativeNumber(cpu, operationSize, 4, register);
}

// Verifies load absolute works for the specified register.
function verifyLoadAbsolute(register: keyof Registers) {
  const operationSize = 3;

  verifyPositiveNumber(cpu, operationSize, 4, register);
  verifyZeroNumber(cpu, operationSize, 4, register);
  verifyNegativeNumber(cpu, operationSize, 4, register);
}

// Verifies load absolute plus an offset from a register works for the specified
// register and offset register.
function verifyLoadAbsolutePlusRegister(register: keyof Registers, offsetRegister: keyof Registers) {
  const operationSize = 3;

  // No page boundary crossed
  cpu.Registers[offsetRegister] = 0x01;
  verifyPositiveNumber(cpu, operationSize, 4, register);
  verifyZeroNumber(cpu, operationSize, 4, register);
  verifyNegativeNumber(cpu, operationSize, 4, register);

  // Page boundary crossed
  cpu.Registers[offsetRegister] = 0x02;
  verifyPositiveNumber(cpu, operationSize, 5, register);

  cpu.Registers[offsetRegister] = 0x03;
  verifyZeroNumber(cpu, operationSize, 5, register);
}

// Verifies load indirect plus X works for register A.
function verifyIndirectX() {
  const operationSize = 2;

  cpu.Registers.X = 0x01;
  verifyPositiveNumber(cpu, operationSize, 6, "A");
  cpu.Registers.X = 0x03;
  verifyZeroNumber(cpu, operationSize, 6, "A");
  cpu.Registers.X = 0x05;
  verifyNegativeNumber(cpu, operationSize, 6, "A");

  // Positive non-zero number case, memory location wraps the zero page address space.
  cpu.Registers.X = 0x06; // This will get added to 0xFF resulting in a wrapped value of 0x5.
  verifyPositiveNumber(cpu, operationSize, 6, "A");
}

// Verifies load indirect plus Y works for register A.
function verifyIndirectY() {
  const operationSize = 2;

  // Positive non-zero number case, memory location doesn't wrap zero page
  cpu.Registers.Y = 0x01; // This is the offset to add to the value in the base memory location
  verifyPositiveNumber(cpu, operationSize, 5, "A");

  // Zero number case
  cpu.Registers.Y = 0x02; // This is the offset to add to the value stored in the zero page address location
  verifyZeroNumber(cpu, operationSize, 5, "A");

  // Negative number case, memory location doesn't wrap zero page
  cpu.Registers.Y = 0x03; // This is the offset to add to the value stored in the zero page address location
  verifyNegativeNumber(cpu, operationSize, 5, "A");

  // Positive non-zero number case, memory location crosses page boundary
  cpu.Registers.Y = 0x01; // This is the offset to add to the value stored in the zero page address location
  verifyZeroNumber(cpu, operationSize, 6, "A");
}

// The order of the test cases in this file depends on the order of the
// tests in the associated ROM. It should always be:
// * Immediate
// * Zero page
// * Zero page plus X
// * Absolute
// * Absolute plus X
// * Absolute plus Y
// * Indirect plus X
// * Indirect plus Y
//
// Tests that don't apply to the register (e.g. there's no zero page plus X on LDX) should be skipped.

test("Verify LDA", () => {
  initialize("LDA");
  verifyLoadImmediate("A");
  verifyLoadZeroPage("A");
  verifyLoadZeroPagePlusRegister("A", "X");
  verifyLoadAbsolute("A");
  verifyLoadAbsolutePlusRegister("A", "X");
  verifyLoadAbsolutePlusRegister("A", "Y");
  verifyIndirectX();
  verifyIndirectY();
});

test("Verify LDX", () => {
  initialize("LDX");
  verifyLoadImmediate("X");
  verifyLoadZeroPage("X");
  verifyLoadZeroPagePlusRegister("X", "Y");
  verifyLoadAbsolute("X");
  verifyLoadAbsolutePlusRegister("X", "Y");
});

test("Verify LDY", () => {
  initialize("LDY");
  verifyLoadImmediate("Y");
  verifyLoadZeroPage("Y");
  verifyLoadZeroPagePlusRegister("Y", "X");
  verifyLoadAbsolute("Y");
  verifyLoadAbsolutePlusRegister("Y", "X");
});
