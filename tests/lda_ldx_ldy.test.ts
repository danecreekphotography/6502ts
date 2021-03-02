/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Memory from "../src/memory";
import Opcodes from "../src/opcodes";
import Registers from "../src/registers";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();

// Verifies load immediate works for the specified register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadImmediate(testCaseNumber: string, register: keyof Registers) {
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Positive non-zero number case
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Zero number case
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 4);

  // Negative number case
  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 6);
}

// Verifies load zero page works for the specified register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadZeroPage(opcode: Opcodes, register: keyof Registers) {
  const memory = new Memory();
  cpu.Initialize(memory);

  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeByte(CODE_LOCATION + 1, 0x00);

  // Positive non-zero number case
  memory.writeByte(0x00, 0x42);
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);

  // Zero number case
  cpu.Initialize(memory);
  memory.writeByte(0x00, 0x00);
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);

  // Negative number case
  cpu.Initialize(memory);
  memory.writeByte(0x00, 0b10010101);
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
  const memory = new Memory();
  cpu.Initialize(memory);

  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeByte(CODE_LOCATION + 1, 0x00);
  cpu.Registers[offsetRegister] = 0x01;

  // Positive non-zero number case
  memory.writeByte(0x01, 0x42);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Zero number case
  cpu.Initialize(memory);
  memory.writeByte(0x01, 0x00);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Negative number case
  cpu.Initialize(memory);
  memory.writeByte(0x01, 0b10010101);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);
}

// Verifies load absolute works for the specified register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadAbsolute(opcode: Opcodes, register: keyof Registers) {
  const memory = new Memory();
  cpu.Initialize(memory);

  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeWord(CODE_LOCATION + 1, 0x2040);

  // Positive non-zero number case
  memory.writeByte(0x2040, 0x42);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Zero number case
  cpu.Initialize(memory);
  memory.writeByte(0x2040, 0x00);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Negative number case
  cpu.Initialize(memory);
  memory.writeByte(0x2040, 0b10010101);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);
}

// Verifies load absolute plus an offset from a register works for the specified
// offset register, register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadAbsolutePlusRegister(opcode: Opcodes, register: keyof Registers, offsetRegister: keyof Registers) {
  const memory = new Memory();
  cpu.Initialize(memory);

  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeWord(CODE_LOCATION + 1, 0x2040);
  cpu.Registers[offsetRegister] = 0x01;

  // Positive non-zero number case, no page boundary crossed
  memory.writeByte(0x2040 + 0x01, 0x42);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Positive non-zero number case, page boundary crossed
  cpu.Initialize(memory);
  cpu.Registers[offsetRegister] = 0xff;
  memory.writeByte(0x2040 + 0xff, 0x42);
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Zero number case, page boundary crossed
  cpu.Initialize(memory);
  cpu.Registers[offsetRegister] = 0xff;
  memory.writeByte(0x2040 + 0xff, 0x00);
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Negative number case, page boundary not crossed
  cpu.Initialize(memory);
  cpu.Registers[offsetRegister] = 0x01;
  memory.writeByte(0x2040 + 0x01, 0b10010101);
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);
}

test("0002 - Verify LDA Immediate", () => {
  verifyLoadImmediate("0002", "A");
});

test("0003 - Verify LDX Immediate", () => {
  verifyLoadImmediate("0003", "X");
});

test("0004 - Verify LDY Immediate", () => {
  verifyLoadImmediate("0004", "Y");
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

test("Verify LDA Absolute Plus Register", () => {
  verifyLoadAbsolutePlusRegister(Opcodes.LDA_AbsoluteX, "A", "X");
});

test("Verify LDX Absolute Plus Register", () => {
  verifyLoadAbsolutePlusRegister(Opcodes.LDX_AbsoluteY, "X", "Y");
});

test("Verify LDY Absolute Plus Register", () => {
  verifyLoadAbsolutePlusRegister(Opcodes.LDY_AbsoluteX, "Y", "X");
});

test("Verify LDA Indirect X", () => {
  const memory = new Memory();
  cpu.Initialize(memory);

  memory.writeByte(CODE_LOCATION, Opcodes.LDA_IndirectX);
  memory.writeByte(CODE_LOCATION + 1, 0x20); // This is the base zero page address
  cpu.Registers.X = 0x04; // This is the offset to add to the zero page address

  // Positive non-zero number case, memory location doesn't wrap zero page
  memory.writeWord(0x0020 + 0x04, 0x2070); // This is the target location in memory that contains the actual data
  memory.writeByte(0x2070, 0x42); // This is the actual data in the target location
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(cpu.Registers.A).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Zero number case, memory location doesn't wrap zero page
  cpu.Initialize(memory);
  memory.writeWord(0x0020 + 0x04, 0x2070); // This is the target location in memory that contains the actual data
  memory.writeByte(0x2070, 0x00); // This is the actual data in the target location
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(cpu.Registers.A).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Negative number case, memory location doesn't wrap zero page
  cpu.Initialize(memory);
  memory.writeWord(0x0020 + 0x04, 0x2070); // This is the target location in memory that contains the actual data
  memory.writeByte(0x2070, 0b10010101); // This is the actual data in the target location
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(cpu.Registers.A).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Positive non-zero number case, memory location wraps the zero page address space.
  cpu.Initialize(memory);
  memory.writeByte(CODE_LOCATION + 1, 0xff); // Base zero page address at the end of zero page address space.
  cpu.Registers.X = 2; // This will get added to 0xFF resulting in a wrapped value of 0x01.
  memory.writeWord(0x01, 0x2070); // This is the target location in memory that contains the actual data
  memory.writeByte(0x2070, 0x42); // This is the actual data in the target location
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(cpu.Registers.A).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);
});

test("Verify LDA Indirect Y", () => {
  const memory = new Memory();
  cpu.Initialize(memory);

  memory.writeByte(CODE_LOCATION, Opcodes.LDA_IndirectY);
  memory.writeByte(CODE_LOCATION + 1, 0x86); // This is the zero page address
  memory.writeWord(0x86, 0x4028); // This is the base memory location of the data

  // Positive non-zero number case, memory location doesn't wrap zero page
  cpu.Registers.Y = 0x10; // This is the offset to add to the value in the base memory location
  memory.writeWord(0x4028 + 0x10, 0x42); // This is the actual data to read
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(cpu.Registers.A).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Positive non-zero number case, memory location crosses page boundary
  cpu.Initialize(memory);
  cpu.Registers.Y = 0xff; // This is the offset to add to the value stored in the zero page address location
  memory.writeWord(0x4028 + 0xff, 0x42); // This is the actual data to read
  expect(cpu.Execute(6, memory)).toBe(6);
  expect(cpu.Registers.A).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Zero number case
  cpu.Initialize(memory);
  cpu.Registers.Y = 0x10; // This is the offset to add to the value stored in the zero page address location
  memory.writeWord(0x4028 + 0x10, 0x00); // This is the actual data to read
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(cpu.Registers.A).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Negative number case, memory location doesn't wrap zero page
  cpu.Initialize(memory);
  cpu.Registers.Y = 0x10; // This is the offset to add to the value stored in the zero page address location
  memory.writeWord(0x4028 + 0x10, 0b10010101); // This is the actual data to read
  expect(cpu.Execute(5, memory)).toBe(5);
  expect(cpu.Registers.A).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);
});
