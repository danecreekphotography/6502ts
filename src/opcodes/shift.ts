/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import Memory from "../memory";

function CapAtEightBits(data: number): number {
  return data & 0b011111111;
}

/**
 * Saves the result of a shift operation to either the accumulator or memory.
 * Consumes one cycle (Accumulator), three cycles (all other address modes except AbsoluteX),
 * or four cycles (AbsoluteX).
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 * @param data The value to store.
 * @param address The address to store the data in. Not used for AddressModes.Accumulator.
 */
function saveShift(cpu: CPU, memory: Memory, addressMode: AddressModes, data: number, address: number) {
  if (addressMode === AddressModes.Accumulator) {
    cpu.Registers.A = data;
    cpu.consumedCycles++;
  } else {
    memory.writeByte(address, data);
    cpu.consumedCycles += 3; // It's three short and I have no idea why.
    // Absolute X gets an extra cycle. Again I have no idea why.
    if (addressMode === AddressModes.AbsoluteX) cpu.consumedCycles++;
  }
}

/**
 * Executes the arithmetic shift left instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function asl(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  // eslint-disable-next-line prefer-const
  let [data, address] = cpu.ReadByteAndAddress(memory, addressMode);

  // Bit 7 goes in the carry flag
  cpu.Flags.C = (data & 0b10000000) > 0;

  // Shift left one, masking off the top-most bit to keep it within
  // the 8-bit range of the CPU.
  data = CapAtEightBits((data <<= 1));

  // Set the flags appropriately
  cpu.SetZAndNFlag(data);

  saveShift(cpu, memory, addressMode, data, address);
}

/**
 * Executes the logical shift right instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function lsr(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  // eslint-disable-next-line prefer-const
  let [data, address] = cpu.ReadByteAndAddress(memory, addressMode);

  // Bit 0 goes in the carry flag
  cpu.Flags.C = (data & 0b00000001) > 0;

  // Do the actual shift
  data >>= 1;

  // Set the flags appropriately
  cpu.SetZAndNFlag(data);

  saveShift(cpu, memory, addressMode, data, address);
}

/**
 * Executes the rotate right instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function ror(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  // eslint-disable-next-line prefer-const
  let [data, address] = cpu.ReadByteAndAddress(memory, addressMode);

  // Temp save what the new carry flag will be
  const newCarry = (data & 0b00000001) === 1;

  // Shift right one
  data >>= 1;

  // Add the carry flag to position 7
  if (cpu.Flags.C) {
    data |= 0b10000000;
  }

  // Set the carry flag to what fell off the right end of the data
  cpu.Flags.C = newCarry;

  // Set the flags appropriately
  cpu.SetZAndNFlag(data);

  saveShift(cpu, memory, addressMode, data, address);
}

/**
 * Executes the rotate left instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */
export function rol(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  // eslint-disable-next-line prefer-const
  let [data, address] = cpu.ReadByteAndAddress(memory, addressMode);

  // Temp save what the new carry flag will be: true if the 7th bit is set.
  const newCarry = data >= 128;

  // Shift left one, masking off the top-most bit to keep it within
  // the 8-bit range of the CPU.
  data = CapAtEightBits((data <<= 1));

  // Add the carry flag to position 0
  if (cpu.Flags.C) {
    data |= 0b00000001;
  }

  // Set the carry flag to what fell off the left end of the data
  cpu.Flags.C = newCarry;

  // Set the flags appropriately
  cpu.SetZAndNFlag(data);

  saveShift(cpu, memory, addressMode, data, address);
}
