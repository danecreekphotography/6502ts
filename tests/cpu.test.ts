/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";

function verifyCpuInitialization(cpu: CPU): void {
  expect(cpu.PC).toBe(cpu.RESET_VECTOR);
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
  const cpu = new CPU();

  verifyCpuInitialization(cpu);
});

test("Verify CPU initialization", () => {
  const cpu = new CPU();

  // Set the program counter and stack pointer to some value
  // then initialize the CPU to make sure everything resets.
  cpu.PC = 0x0042;
  cpu.SP = 0x0050;
  cpu.Initialize();

  verifyCpuInitialization(cpu);
});
