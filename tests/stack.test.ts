/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";
import Registers from "../src/registers";
import { createMemoryFromTestRom } from "./helpers";

const CODE_LOCATION = 0x0200;

const cpu = new CPU();

test("Verify stack operations", () => {
  const memory = createMemoryFromTestRom("PHA_PLA_PHP_PLP");
  cpu.Initialize(memory);

  // Initialize the stack pointer
  expect(cpu.Execute(4, memory)).toBe(4);

  // Push positive number onto the stack
  cpu.Registers.A = 0x42;
  expect(cpu.Execute(3, memory)).toBe(3);

  // Push zero onto the stack
  cpu.Registers.A = 0x00;
  expect(cpu.Execute(3, memory)).toBe(3);

  // Push negative number onto the stack
  cpu.Registers.A = 0b10010101;
  expect(cpu.Execute(3, memory)).toBe(3);

  // Pop negative number off the stack
  cpu.Registers.A = 0x00;
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers.A).toBe(0b10010101);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(true);

  // Pop zero off the stack
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers.A).toBe(0x00);
  expect(cpu.Flags.Z).toBe(true);
  expect(cpu.Flags.N).toBe(false);

  // Pop positive number off the stack
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Registers.A).toBe(0x42);
  expect(cpu.Flags.Z).toBe(false);
  expect(cpu.Flags.N).toBe(false);

  // Push a full set of status flags onto the stack
  cpu.Flags.Status = 0xff;
  expect(cpu.Execute(3, memory)).toBe(3);

  // Pop a full set of status flags off of the stack
  cpu.Flags.Status = 0x00;
  expect(cpu.Execute(4, memory)).toBe(4);
  expect(cpu.Flags.Status).toBe(0xff);
});
