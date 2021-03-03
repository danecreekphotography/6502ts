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
const DATA_LOCATION = 0x3000;

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
function verifyLoadZeroPage(testCaseNumber: string, register: keyof Registers) {
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Positive non-zero number case
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);

  // Zero number case
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);

  // Negative number case
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
}

// Verifies load zero page plus an offset from a register works for the specified
// offset register, register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.

function verifyLoadZeroPagePlusRegister(
  testCaseNumber: string,
  register: keyof Registers,
  offsetRegister: keyof Registers,
) {
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  cpu.Registers[offsetRegister] = 0x03;

  // Positive non-zero number case
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);

  // Zero number case
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 4);

  // Negative number case
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 6);
}

// Verifies load absolute works for the specified register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadAbsolute(testCaseNumber: string, register: keyof Registers) {
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  // Positive non-zero number case
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Zero number case
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 6);

  // Negative number case
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 9);
}

// Verifies load absolute plus an offset from a register works for the specified
// offset register, register and value.
// Additionally tests that zero and negative numbers properly set the
// accumulator flags.
function verifyLoadAbsolutePlusRegister(
  testCaseNumber: string,
  register: keyof Registers,
  offsetRegister: keyof Registers,
) {
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  cpu.Registers[offsetRegister] = 0x03;

  // Positive non-zero number case, no page boundary crossed
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Zero number case, page boundary not crossed
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.PC).toBe(CODE_LOCATION + 6);

  // Negative number case, page boundary not crossed
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers[register]).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);
  expect(cpu.PC).toBe(CODE_LOCATION + 9);

  // Positive non-zero number case, page boundary crossed
  // cpu.Initialize(memory);
  // cpu.Registers[offsetRegister] = 0xff;
  // memory.writeByte(0x2040 + 0xff, 0x42);
  // expect(cpu.Execute(5, memory)).toBe(5);
  // expect(cpu.Registers[register]).toBe(0x42);
  // expect(cpu.Flags.Z).toBe(false);
  // expect(cpu.Flags.N).toBe(false);
  // expect(cpu.PC).toBe(CODE_LOCATION + 3);

  // Zero number case, page boundary crossed
  // cpu.Initialize(memory);
  // cpu.Registers[offsetRegister] = 0xff;
  // memory.writeByte(0x2040 + 0xff, 0x00);
  // expect(cpu.Execute(5, memory)).toBe(5);
  // expect(cpu.Registers[register]).toBe(0x00);
  // expect(cpu.Flags.Z).toBe(true);
  // expect(cpu.Flags.N).toBe(false);
  // expect(cpu.PC).toBe(CODE_LOCATION + 3);
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

test("0005 - Verify LDA Zero Page", () => {
  verifyLoadZeroPage("0005", "A");
});

test("0006 - Verify LDX Zero Page", () => {
  verifyLoadZeroPage("0006", "X");
});

test("0007 - Verify LDY Zero Page", () => {
  verifyLoadZeroPage("0007", "Y");
});

test("0008 - Verify LDA Zero Page Plus X", () => {
  verifyLoadZeroPagePlusRegister("0008", "A", "X");
});

test("0009 - Verify LDX Zero Page Plus Y", () => {
  verifyLoadZeroPagePlusRegister("0009", "X", "Y");
});

test("0010 - Verify LDY Zero Page Plus X", () => {
  verifyLoadZeroPagePlusRegister("0010", "Y", "X");
});

test("0011 - Verify LDA Absolute", () => {
  verifyLoadAbsolute("0011", "A");
});

test("0012 - Verify LDX Absolute", () => {
  verifyLoadAbsolute("0012", "X");
});

test("0013 - Verify LDY Absolute", () => {
  verifyLoadAbsolute("0013", "Y");
});

test("0014 - Verify LDA Absolute Plus Register", () => {
  verifyLoadAbsolutePlusRegister("0014", "A", "X");
});

test("0015 - Verify LDX Absolute Plus Register", () => {
  verifyLoadAbsolutePlusRegister("0015", "X", "Y");
});

test("0016 - Verify LDY Absolute Plus Register", () => {
  verifyLoadAbsolutePlusRegister("0016", "Y", "X");
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
