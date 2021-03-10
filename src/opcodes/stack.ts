/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import Memory from "../memory";

/**
 * Executes pha instruction, placing the A register on the stack.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function pha(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  cpu.StackPushByte(memory, cpu.Registers.A);
}

/**
 * Executes pla instruction, populating the A register with the value on the stack.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function pla(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  cpu.Registers.A = cpu.StackPopByte(memory);
  cpu.consumedCycles++;
  cpu.SetFlagsOnRegisterLoad("A");
}

/**
 * Executes php instruction, placing the status flags on the stack.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function php(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  cpu.StackPushByte(memory, cpu.Flags.Status);
}

/**
 * Executes plp instruction, populating the status flags with the value on stack.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function plp(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  cpu.Flags.Status = cpu.StackPopByte(memory);
  cpu.consumedCycles++; // Consume an extra cycle. Don't know why but it is required.
}
