/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Memory from "../src/memory";
import Opcodes from "../src/opcodes";
import Registers from "../src/registers";

const CODE_LOCATION = 0x6000;

const cpu = new CPU();
const memory = new Memory();

// Before each test clear the memory, set the code location in the reset vector
// and initialize the CPU.
beforeEach(() => {
  memory.Clear();
  memory.writeWord(cpu.RESET_VECTOR, CODE_LOCATION);

  cpu.Initialize(memory);
});

function verifyStoreZeroPage(opcode: Opcodes, register: keyof Registers) {
  memory.writeByte(CODE_LOCATION, opcode);
  memory.writeByte(CODE_LOCATION + 1, 0x40); // Location to write the accumulator value

  cpu.Registers[register] = 0xff;

  expect(cpu.Execute(3, memory)).toBe(3);
  expect(memory.readByte(0x40)).toBe(0xff);
  expect(cpu.PC).toBe(CODE_LOCATION + 2);
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

test("Verify STA zero page", () => {
  verifyStoreZeroPage(Opcodes.STA_Zero_Page, "A");
});

test("Verify STX zero page", () => {
  verifyStoreZeroPage(Opcodes.STX_Zero_Page, "X");
});

test("Verify STY zero page", () => {
  verifyStoreZeroPage(Opcodes.STY_Zero_Page, "Y");
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
