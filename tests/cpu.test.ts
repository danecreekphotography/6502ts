/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../src/addressModes";
import CPU from "../src/cpu";
import Memory from "../src/memory";

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
  expect(cpu.Registers.SP).toBe(0x0000);
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
  cpu.Registers.SP = 0x0050;
  cpu.Initialize(memory);

  verifyCpuInitialization(cpu);
});

test("Verify CPU reset vector", () => {
  // Write a basic command at the reset vector code location and ensure it executes correctly.
  memory.writeByte(CODE_LOCATION, 0xa9); // LDA Immediate
  memory.writeByte(CODE_LOCATION + 1, 0x42);

  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.A).toBe(0x42);
});

test("Verify reading an invalid opcode", () => {
  memory.writeByte(CODE_LOCATION, 0xa9); // LDA Immediate
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
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.Absolute, true)).toEqual(0x3000);

  // Absolute + X
  memory.Clear();
  cpu.PC = baseAddressLocation;
  cpu.Registers.X = 0x01;
  memory.writeWord(baseAddressLocation, 0x3000);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.AbsoluteX, true)).toEqual(0x3001);

  // Absolute + X across page boundary
  memory.Clear();
  cpu.PC = baseAddressLocation;
  cpu.Registers.X = 0x01;
  memory.writeWord(baseAddressLocation, 0x30ff);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.AbsoluteX, true)).toEqual(0x30ff + 0x01);

  // Absolute + Y
  memory.Clear();
  cpu.PC = baseAddressLocation;
  cpu.Registers.Y = 0x01;
  memory.writeWord(baseAddressLocation, 0x3000);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.AbsoluteX, true)).toEqual(0x3001);

  // Absolute + Y across page boundary
  memory.Clear();
  cpu.PC = baseAddressLocation;
  cpu.Registers.Y = 0x01;
  memory.writeWord(baseAddressLocation, 0x30ff);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.AbsoluteX, true)).toEqual(0x30ff + 0x01);

  // Zero page
  memory.Clear();
  cpu.PC = baseAddressLocation;
  memory.writeByte(baseAddressLocation, 0x42);
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPage, true)).toEqual(0x42);

  // Zero page + X, no wrap
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0x42);
  cpu.Registers.X = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageX, true)).toEqual(0x42 + 0x01);

  // Zero page + X, wrap
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0xff);
  cpu.Registers.X = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageX, true)).toEqual(0x00);

  // Zero page + Y
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0x42);
  cpu.Registers.Y = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageY, true)).toEqual(0x42 + 0x01);

  // Zero page + X, wrap
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0xff);
  cpu.Registers.Y = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.ZeroPageY, true)).toEqual(0x00);

  // Indirect X
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeWord(0x01, 0x4200);
  cpu.Registers.X = 0x01;
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.IndirectX, true)).toEqual(0x4200);

  // Indirect Y
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0x01); // Stores the zero page address location that has the actual address
  memory.writeWord(0x01, 0x4200); // Stores the address
  cpu.Registers.Y = 0x01; // The value to add to the address retrieved from zero page
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.IndirectY, true)).toEqual(0x4200 + 0x01);

  // Indirect Y across page boundary
  memory.Clear();
  cpu.PC = 0x00;
  memory.writeByte(0x00, 0x01); // Stores the zero page address location that has the actual address
  memory.writeWord(0x01, 0x42ff); // Stores the address
  cpu.Registers.Y = 0x01; // The value to add to the address retrieved from zero page
  expect(cpu.CalculateAddressFromAddressMode(memory, AddressModes.IndirectY, true)).toEqual(0x42ff + 0x01);

  // Invalid address mode
  expect(() => {
    cpu.CalculateAddressFromAddressMode(memory, AddressModes.Immediate, true);
  }).toThrowError();
});
