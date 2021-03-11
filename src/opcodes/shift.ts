/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import { FlagMask } from "../flags";
import Memory from "../memory";

function CapAtEightBits(data: number): number {
  if (data >= 0b100000000) {
    data -= 0b100000000;
  }

  return data;
}

/**
 * Returns the data at the requested location using the specified address mode
 * and the address it was read from. Handy to then update the data and write it back
 * to the same location in memory.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 * @returns
 */
function GetDataAndAddress(cpu: CPU, memory: Memory, addressMode: AddressModes): [data: number, address: number] {
  let data = 0;
  let address = 0;

  if (addressMode === AddressModes.Accumulator) {
    data = cpu.Registers.A;
  } else {
    address = cpu.CalculateAddressFromAddressMode(memory, addressMode, false);
    data = memory.readByte(address);
  }

  return [data, address];
}

/**
 * Executes the arithmatic shift left instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 */

export function asl(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  let [data, address] = GetDataAndAddress(cpu, memory, addressMode);

  // Bit 7 goes in the carry flag
  cpu.Flags.C = (data & 0b10000000) > 0;
  data <<= 1;

  // Because number isn't a specific 8-bit byte handle shifting past the 8th bit
  data = CapAtEightBits(data);

  // Set the zero flag appropriately
  cpu.Flags.Z = data === 0;

  if (addressMode === AddressModes.Accumulator) {
    cpu.Registers.A = data;
    cpu.consumedCycles++;
  } else {
    memory.writeByte(address, data);
    cpu.consumedCycles += 3; // It's three short and I have no idea why.
  }

  // Absolute X gets an extra cycle. Again I have no idea why.
  if (addressMode === AddressModes.AbsoluteX) cpu.consumedCycles++;
}
