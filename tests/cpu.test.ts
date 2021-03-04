/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../src/addressModes";
import CPU from "../src/cpu";
import Memory from "../src/memory";
import Opcodes from "../src/opcodes";

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

function verifyCpuInitialization(cpu: CPU): void {
  expect(cpu.PC).toBe(CODE_LOCATION);
  expect(cpu.SP).toBe(0x0000);
  expect(cpu.Registers.A).toBe(0);
  expect(cpu.Registers.X).toBe(0);
  expect(cpu.Registers.Y).toBe(0);
  expect(cpu.Flags.B).toBe(false);
  expect(cpu.Flags.C).toBe(false);
  expect(cpu.Flags.D).toBe(false);
  expect(cpu.Flags.I).toBe(false);
  expect(cpu.Flags.N).toBe(false);
  expect(cpu.Flags.V).toBe(false);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.Unused).toBe(true);
  expect(cpu.Flags.Status).toBe(0b00100000);
}

test("Verify CPU constructor", () => {
  verifyCpuInitialization(cpu);
});

test("Verify CPU initialization", () => {
  // Set the program counter and stack pointer to some value
  // then initialize the CPU to make sure everything resets.
  cpu.PC = 0x0042;
  cpu.SP = 0x0050;
  cpu.Initialize(memory);

  verifyCpuInitialization(cpu);
});

test("Verify CPU reset vector", () => {
  // Write a basic command at the reset vector code location and ensure it executes correctly.
  memory.writeByte(CODE_LOCATION, Opcodes.LDA_Immediate);
  memory.writeByte(CODE_LOCATION + 1, 0x42);

  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.A).toBe(0x42);
});

test("Verify reading an invalid opcode", () => {
  memory.writeByte(CODE_LOCATION, Opcodes.LDA_Immediate);
  memory.writeByte(CODE_LOCATION + 1, 0x42);

  expect(() => {
    cpu.Execute(3, memory);
  }).toThrowError();
});

test("Verify address mode calculations", () => {
  const baseAddressLocation = 0x2000;

  // Absolute
  cpu.PC = baseAddressLocation;
  memory.writeWord(baseAddressLocation, 0x3000);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.Absolute)).toBe(0x3000);

  // Absolute + X
  memory.Clear();
  cpu.PC = baseAddressLocation;
  cpu.Registers.X = 0x01;
  memory.writeWord(baseAddressLocation, 0x3000);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.AbsoluteX)).toBe(0x3001);

  // Absolute + Y
  memory.Clear();
  cpu.PC = baseAddressLocation;
  cpu.Registers.Y = 0x01;
  memory.writeWord(baseAddressLocation, 0x3000);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.AbsoluteX)).toBe(0x3001);

  // Zero page
  memory.Clear();
  cpu.PC = baseAddressLocation;
  memory.writeByte(baseAddressLocation, 0x42);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPage)).toBe(0x42);

  // Zero page + X, no wrap
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0x42);
  cpu.Registers.X = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageX)).toBe(0x42 + 0x01);

  // Zero page + X, wrap
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0xff);
  cpu.Registers.X = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageX)).toBe(0x00);

  // Zero page + Y
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0x42);
  cpu.Registers.Y = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageY)).toBe(0x42 + 0x01);

  // Zero page + X, wrap
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0xff);
  cpu.Registers.Y = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageY)).toBe(0x00);

  // Indirect X
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeWord(0x01, 0x4200);
  cpu.Registers.X = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.IndirectX)).toBe(0x4200);

  // Indirect Y
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeWord(0x00, 0x4200);
  cpu.Registers.Y = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.IndirectY)).toBe(0x4201);

  // Invalid address mode
  expect(() => {
    cpu.CalculateAddressFromAddressMode(memory, AddressModes.Immediate);
  }).toThrowError();
});
