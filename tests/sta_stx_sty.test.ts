/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Registers from "../src/registers";
import Memory from "../src/memory";
import Opcodes from "../src/opcodes";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();
const memory = new Memory();

function verifyStoreZeroPage(testCaseNumber: string, register: keyof Registers) {
  const operationSize = 2;
  let expectedPCLocation = CODE_LOCATION;
  const memory = createMemoryFromTestRom(testCaseNumber);
  cpu.Initialize(memory);

  const priorFlagStatus = cpu.Flags.Status;

  // Positive number case
  cpu.Registers[register] = 0x42;
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(memory.readByte(0x00)).toBe(0x42);
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
  expect(cpu.Flags.Status).toBe(priorFlagStatus); // Operation shouldn't modify the flags

  // Zero number
  cpu.Registers[register] = 0x00;
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(memory.readByte(0x00)).toBe(0x00);
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
  expect(cpu.Flags.Status).toBe(priorFlagStatus); // Operation shouldn't modify the flags

  // Negative number
  cpu.Registers[register] = 0b10010101;
  expect(cpu.Execute(3, memory)).toBe(3);
  expect(memory.readByte(0x00)).toBe(0b10010101);
  expectedPCLocation += operationSize;
  expect(cpu.PC).toBe(expectedPCLocation);
  expect(cpu.Flags.Status).toBe(priorFlagStatus); // Operation shouldn't modify the flags
}

function verifyStoreZeroPagePlusRegister(opcode: Opcodes, register: keyof Registers, offsetRegister: "X" | "Y") {
  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeByte(CODE_LOCATION + 1, 0x40); // Location to write the accumulator value

  cpu.Registers[offsetRegister] = 0x01; // This gets added to the zero page location
  cpu.Registers[register] = 0xff;

  expect(cpu.Execute(4, memory)).toBe(4);
  expect(memory.readByte(0x40 + 0x01)).toBe(0xff);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);
}

function verifyStoreAbsolute(opcode: Opcodes, register: keyof Registers) {
  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeWord(CODE_LOCATION + 1, 0x4000); // Location to write the accumulator value

  cpu.Registers[register] = 0xff;

  expect(cpu.Execute(4, memory)).toBe(4);
  expect(memory.readByte(0x4000)).toBe(0xff);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);
}

function verifyStoreAbsolutePlusOffset(opcode: Opcodes, register: keyof Registers, offsetRegister: "X" | "Y") {
  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeWord(CODE_LOCATION + 1, 0x4000); // Location to write the accumulator value

  cpu.Registers[offsetRegister] = 0x01;
  cpu.Registers[register] = 0xff;

  expect(cpu.Execute(5, memory)).toBe(5);
  expect(memory.readByte(0x4000 + 0x01)).toBe(0xff);
  expect(cpu.PC).toBe(CODE_LOCATION + 3);
}

test("Verify STA zero page", () => {
  verifyStoreZeroPage("0100", "A");
});

test("Verify STX zero page", () => {
  verifyStoreZeroPage("0101", "X");
});

test("Verify STY zero page", () => {
  verifyStoreZeroPage("0102", "Y");
});

test("Verify STA zero page plus X", () => {
  verifyStoreZeroPagePlusRegister(Opcodes.STA_Zero_PageX, "A", "X");
});

test("Verify STX zero page plus Y", () => {
  verifyStoreZeroPagePlusRegister(Opcodes.STX_Zero_PageY, "X", "Y");
});

test("Verify STY zero page plus X", () => {
  verifyStoreZeroPagePlusRegister(Opcodes.STY_Zero_PageX, "Y", "X");
});

test("Verify STA absolute", () => {
  verifyStoreAbsolute(Opcodes.STA_Absolute, "A");
});

test("Verify STX absolute", () => {
  verifyStoreAbsolute(Opcodes.STX_Absolute, "X");
});

test("Verify STY absolute", () => {
  verifyStoreAbsolute(Opcodes.STY_Absolute, "Y");
});

test("Verify STA absolute plus X", () => {
  verifyStoreAbsolutePlusOffset(Opcodes.STA_AbsoluteX, "A", "X");
});

test("Verify STA absolute plus Y", () => {
  verifyStoreAbsolutePlusOffset(Opcodes.STA_AbsoluteY, "A", "Y");
});
