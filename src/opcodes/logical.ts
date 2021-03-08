/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import { FlagMask } from "../flags";
import Memory from "../memory";

/**
 * Executes the BIT operand, reading the value to compare using the specified address mode.
 * @param memory The memory to reference during execution
 * @param addressMode The addressing mode to use when reading from memory
 */
export function bit(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  const data = cpu.ReadDataFromMemory(memory, addressMode);

  cpu.Flags.N = (data & FlagMask.N) > 0;
  cpu.Flags.V = (data & FlagMask.V) > 0;
  cpu.Flags.Z = (data & cpu.Registers.A) === 0;
}
