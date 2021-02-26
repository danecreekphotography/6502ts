/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../src/cpu";

function verifyCpuInitialization(cpu: CPU): void {
  expect(cpu.PC).toBe(0x0000);
  expect(cpu.SP).toBe(0x0000);
  expect(cpu.Registers.A).toBe(0);
  expect(cpu.Registers.X).toBe(0);
  expect(cpu.Registers.Y).toBe(0);
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
