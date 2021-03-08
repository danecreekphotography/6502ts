/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import { FlagMask } from "../src/flags";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();

/**
 * Tests the zero and negative flag cases for AND. Any registers
 * that need to be configured for the test case's addressing mode should be
 * set before calling this function.
 * @param operationSize The number of bytes the operation takes
 * @param expectedCycles The expected number of clock cycles to run the operation
 */
function verifyAnd(testCaseNumber: string) {
  const operationSize = 2;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Set all the flags
  cpu.Flags.Status = 0b11111111;
  let expectedPCLocation = CODE_LOCATION;

  // Test negative
  cpu.Registers.A = FlagMask.N;
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

/**
 * Tests the zero and negative flag cases for EOR. Any registers
 * that need to be configured for the test case's addressing mode should be
 * set before calling this function.
 * @param operationSize The number of bytes the operation takes
 * @param expectedCycles The expected number of clock cycles to run the operation
 */
function verifyEor(testCaseNumber: string) {
  const operationSize = 2;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Set all the flags
  cpu.Flags.Status = 0b11111111;
  let expectedPCLocation = CODE_LOCATION;

  // Register A has N and Z set, memory has 0b10000000
  cpu.Registers.A = FlagMask.N | FlagMask.Z;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Flags.Z).toBe(false); // Zero flag should get cleared because the result isn't zero
  expect(cpu.Flags.N).toBe(false); // Negative flag should get cleared because this is exclusive or
  expect(cpu.Flags.Status).toBe(0b01111101); // Everything else should be set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);

  // Register A has N and Z set, memory has 0b10000000
  cpu.Registers.A = FlagMask.N | 0x00;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Flags.Z).toBe(true); // Zero flag should get set
  expect(cpu.Flags.N).toBe(false); // Negative flag should clear
  expect(cpu.Flags.Status).toBe(0b01111111); // Everything else should be set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
}

/**
 * Tests the zero and negative flag cases for ORA. Any registers
 * that need to be configured for the test case's addressing mode should be
 * set before calling this function.
 * @param operationSize The number of bytes the operation takes
 * @param expectedCycles The expected number of clock cycles to run the operation
 */
function verifyOra(testCaseNumber: string) {
  const operationSize = 2;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Set all the flags
  cpu.Flags.Status = 0b11111111;
  let expectedPCLocation = CODE_LOCATION;

  // Register A has N and Z set, memory has 0b10000000
  cpu.Registers.A = FlagMask.N | FlagMask.Z;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Flags.Z).toBe(false); // Zero flag should get cleared because the result isn't zero
  expect(cpu.Flags.N).toBe(true); // Negative flag should get set
  expect(cpu.Flags.Status).toBe(0b11111101); // Everything else should be set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);

  // Register A has N and Z set, memory has 0b10000000
  cpu.Registers.A = 0x00;
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Flags.Z).toBe(true); // Zero flag should get set
  expect(cpu.Flags.N).toBe(false); // Negative flag should clear
  expect(cpu.Flags.Status).toBe(0b01111111); // Everything else should be set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
}

/**
 * Tests the zero and negative flag cases for ORA. Any registers
 * that need to be configured for the test case's addressing mode should be
 * set before calling this function.
 * @param operationSize The number of bytes the operation takes
 * @param expectedCycles The expected number of clock cycles to run the operation
 */
function verifyBit(testCaseNumber: string) {
  const operationSize = 3;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Set all the flags
  cpu.Flags.Status = 0b11111111;

  let expectedPCLocation = CODE_LOCATION;

  // Memory has 0b11000000
  cpu.Registers.A = 0b11000000;
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Flags.V).toBe(true); // Overflow flag should get set
  expect(cpu.Flags.N).toBe(true); // Negative flag should get set
  expect(cpu.Flags.Z).toBe(false); // Zero should get cleared
  expect(cpu.Flags.Status).toBe(0b11111101); // Everything else should be set except zero
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);

  // Memory has 0b11000000
  cpu.Registers.A = 0b00110000;
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Flags.N).toBe(true); // Negative flag should clear
  expect(cpu.Flags.V).toBe(true); // Overflow flag should clear
  expect(cpu.Flags.Z).toBe(true); // Zero flag should get set
  expect(cpu.Flags.Status).toBe(0b11111111); // Everything else should be set
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
}

test("0300 - AND immediate", () => {
  verifyAnd("0300");
});

test("0301 - EOR immediate", () => {
  verifyEor("0301");
});

test("0302 - ORA immediate", () => {
  verifyOra("0302");
});

test("0303 - BIT immediate", () => {
  verifyBit("0303");
});
