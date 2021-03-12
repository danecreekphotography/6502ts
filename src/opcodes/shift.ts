/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import Memory from "../memory";

function CapAtEightBits(data: number): number {
  if (data >= 0b100000000) {
    data -= 0b100000000;
  }

  return data;
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

  // Do the actual shift
  data <<= 1;

  // Because number isn't a specific 8-bit byte handle shifting past the 8th bit
  data = CapAtEightBits(data);

  // Set the zero flag appropriately
  cpu.Flags.Z = data === 0;

  saveShift(cpu, memory, addressMode, data, address);
}
