/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
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
  data = cpu.CapAtEightBits(data);
  cpu.SetZAndNFlag(data);

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
 * Executes a memory increment instruction
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function incrementMemory(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  const [data, address] = cpu.ReadByteAndAddress(memory, addressMode);

  const incrementedData = IncrementAndSetFlags(cpu, data);
  cpu.consumedCycles += 2; // +2 here otherwise this is one short of expected

  memory.writeByte(address, incrementedData);
  cpu.consumedCycles++;

  // Absolute X mode consumes an extra cycle for no apparent reason.
  if (addressMode === AddressModes.AbsoluteX) cpu.consumedCycles++;
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

/**
 * Executes a memory decrement instruction
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function decrementMemory(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  const [data, address] = cpu.ReadByteAndAddress(memory, addressMode);

  const incrementedData = DecrementAndSetFlags(cpu, data);
  cpu.consumedCycles += 2; // +2 here otherwise this is one short of expected

  memory.writeByte(address, incrementedData);
  cpu.consumedCycles++;

  // Absolute X mode consumes an extra cycle for no apparent reason.
  if (addressMode === AddressModes.AbsoluteX) cpu.consumedCycles++;
}
