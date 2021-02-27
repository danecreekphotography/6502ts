/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

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
