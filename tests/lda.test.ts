/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Memory from "../src/memory";
import Opcodes from "../src/opcodes";
import Registers from "../src/registers";

// Verifies load immediate works for the specified register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadImmediate(opcode: Opcodes, register: keyof Registers) {
  const cpu = new CPU();
  const memory = new Memory();

  memory.write(cpu.RESET_VECTOR, opcode);

  // Positive non-zero number case
  memory.write(cpu.RESET_VECTOR + 1, 0x42);
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);

  // Zero number case
  cpu.Initialize();
  memory.write(cpu.RESET_VECTOR + 1, 0x00);
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);

  // Negative number case
  cpu.Initialize();
  memory.write(cpu.RESET_VECTOR + 1, 0b10010101);
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
}

// Verifies load zero page works for the specified register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadZeroPage(opcode: Opcodes, register: keyof Registers) {
  const cpu = new CPU();
  const memory = new Memory();

  memory.write(cpu.RESET_VECTOR, opcode);
  memory.write(cpu.RESET_VECTOR + 1, 0x00);

  // Positive non-zero number case
  memory.write(0x00, 0x42);
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);

  // Zero number case
  cpu.Initialize();
  memory.write(0x00, 0x00);
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);

  // Negative number case
  cpu.Initialize();
  memory.write(0x00, 0b10010101);
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
}

// Verifies load zero page plus an offset from a register works for the specified
// offset register, register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.

function verifyLoadZeroPagePlusRegister(opcode: Opcodes, register: keyof Registers, offsetRegister: keyof Registers) {
  const cpu = new CPU();
  const memory = new Memory();

  memory.write(cpu.RESET_VECTOR, opcode);
  memory.write(cpu.RESET_VECTOR + 1, 0x00);
  cpu.Registers[offsetRegister] = 0x01;

  // Positive non-zero number case
  memory.write(0x01, 0x42);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);

  // Zero number case
  cpu.Initialize();
  memory.write(0x01, 0x00);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);

  // Negative number case
  cpu.Initialize();
  memory.write(0x01, 0b10010101);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
}

// Verifies load zero page plus an offset from a register works for the specified
// offset register, register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.

function verifyLoadAbsolute(opcode: Opcodes, register: keyof Registers) {
  const cpu = new CPU();
  const memory = new Memory();

  memory.write(cpu.RESET_VECTOR, opcode);
  memory.write(cpu.RESET_VECTOR + 1, 0x20);
  memory.write(cpu.RESET_VECTOR + 2, 0x40);

  // Positive non-zero number case
  memory.write(0x2040, 0x42);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
}

test("Verify LDA Immediate", () => {
  verifyLoadImmediate(Opcodes.LDA_Immediate, "A");
});

test("Verify LDX Immediate", () => {
  verifyLoadImmediate(Opcodes.LDX_Immediate, "X");
});

test("Verify LDY Immediate", () => {
  verifyLoadImmediate(Opcodes.LDY_Immediate, "Y");
});

test("Verify LDA Zero Page", () => {
  verifyLoadZeroPage(Opcodes.LDA_Zero_Page, "A");
});

test("Verify LDX Zero Page", () => {
  verifyLoadZeroPage(Opcodes.LDX_Zero_Page, "X");
});

test("Verify LDY Zero Page", () => {
  verifyLoadZeroPage(Opcodes.LDY_Zero_Page, "Y");
});

test("Verify LDA Zero Page Plus X", () => {
  verifyLoadZeroPagePlusRegister(Opcodes.LDA_Zero_PageX, "A", "X");
});

test("Verify LDX Zero Page Plus Y", () => {
  verifyLoadZeroPagePlusRegister(Opcodes.LDX_Zero_PageY, "X", "Y");
});

test("Verify LDY Zero Page Plus X", () => {
  verifyLoadZeroPagePlusRegister(Opcodes.LDY_Zero_PageX, "Y", "X");
});

test("Verify LDA Absolute", () => {
  verifyLoadAbsolute(Opcodes.LDA_Absolute, "A");
});

test("Verify LDX Absolute", () => {
  verifyLoadAbsolute(Opcodes.LDX_Absolute, "X");
});

test("Verify LDY Absolute", () => {
  verifyLoadAbsolute(Opcodes.LDY_Absolute, "Y");
});
