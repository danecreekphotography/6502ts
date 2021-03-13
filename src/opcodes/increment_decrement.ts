/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../cpu";
import Memory from "../memory";

/**
 * Increments a value within an 8-bit range and sets CPU flags accordingly.
 * @param cpu The CPU to use when executing the command.
 * @param data The data to increment.
 * @returns The incremented value.
 */
function IncrementAndSetFlags(cpu: CPU, data: number): number {
  data++;
  cpu.SetZAndNFlag(data);
  data = cpu.CapAtEightBits(data);

  return data;
}

/**
 * Decrements a value within an 8-bit range and sets CPU flags accordingly.
 * @param cpu The CPU to use when executing the command.
 * @param data The data to increment.
 * @returns The incremented value.
 */
function DecrementAndSetFlags(cpu: CPU, data: number): number {
  data--;

  // Convert to signed 8-bit value.
  if (data < 0) data += 256;

  cpu.SetZAndNFlag(data);

  return data;
}

/**
 * Executes a register increment instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @params register The register to increment.
 */
export function incrementRegister(cpu: CPU, register: "X" | "Y"): void {
  cpu.Registers[register] = IncrementAndSetFlags(cpu, cpu.Registers[register]);
  cpu.consumedCycles++;
}

/**
 * Executes a register decrement instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @params register The register to increment.
 */
export function decrementRegister(cpu: CPU, register: "X" | "Y"): void {
  cpu.Registers[register] = DecrementAndSetFlags(cpu, cpu.Registers[register]);
  cpu.consumedCycles++;
}
