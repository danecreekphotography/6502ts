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

test("Verify JMP absolute", () => {
  const JMP_LOCATION = 0x7000;
  memory.writeByte(CODE_LOCATION, Opcodes.JMP_Absolute);
  memory.writeWord(CODE_LOCATION + 1, JMP_LOCATION);
  memory.writeByte(JMP_LOCATION, Opcodes.LDA_Immediate);
  memory.writeByte(JMP_LOCATION + 1, 0x42);

  expect(cpu.Execute(5, memory)).toBe(5);
  expect(cpu.Registers.A).toBe(0x42);
  expect(cpu.PC).toBe(JMP_LOCATION + 2);
});

test("Verify JMP indirect", () => {
  const JMP_LOCATION = 0x7000; // Where the indirect address will get stored
  const INDIRECT_ADDRESS_LOCATION = 0x7050; // The actual address to jump to

  // Store the jump instruction and jump location
  memory.writeByte(CODE_LOCATION, Opcodes.JPM_Indirect);
  memory.writeWord(CODE_LOCATION + 1, JMP_LOCATION);

  // Store the address to jump to
  memory.writeWord(JMP_LOCATION, INDIRECT_ADDRESS_LOCATION);

  // Store something to execute at the code location
  memory.writeByte(INDIRECT_ADDRESS_LOCATION, Opcodes.LDA_Immediate);
  memory.writeByte(INDIRECT_ADDRESS_LOCATION + 1, 0x42);

  expect(cpu.Execute(7, memory)).toBe(7);
  expect(cpu.Registers.A).toBe(0x42);
  expect(cpu.PC).toBe(INDIRECT_ADDRESS_LOCATION + 2);
});
