/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Memory from "../src/memory";
import Opcodes from "../src/opcodes";

test("Verify LDA Immediate", () => {
  const cpu = new CPU();
  const memory = new Memory();

  memory.write(cpu.RESET_VECTOR, Opcodes.LDA_Immediate);
  memory.write(cpu.RESET_VECTOR + 1, 0x42);

  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.A).toBe(0x42);
});

test("Verify LDX Immediate", () => {
  const cpu = new CPU();
  const memory = new Memory();

  memory.write(cpu.RESET_VECTOR, Opcodes.LDX_Immediate);
  memory.write(cpu.RESET_VECTOR + 1, 0x42);

  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.X).toBe(0x42);
});

test("Verify LDY Immediate", () => {
  const cpu = new CPU();
  const memory = new Memory();

  memory.write(cpu.RESET_VECTOR, Opcodes.LDY_Immediate);
  memory.write(cpu.RESET_VECTOR + 1, 0x42);

  expect(cpu.Execute(2, memory)).toBe(2);
  expect(cpu.Registers.Y).toBe(0x42);
});
