/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import Memory from "../memory";

/**
 * Executes a branch instruction.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory to reference during execution.
 * @param addressMode The addressing mode to use when reading from memory.
 * @param flag The flag to test
 * @param test The boolean value that results in the branch occurring
 */

export function branch(
  cpu: CPU,
  memory: Memory,
  addressMode: AddressModes,
  flag: "C" | "Z" | "N" | "V",
  test: boolean,
): void {
  let offset = memory.readByte(cpu.PC++);
  cpu.consumedCycles++;

  // The offset is a signed 8 bit value so convert to negative if necessary
  if (offset > 127) {
    offset -= 256;
  }

  // Check to see if the test passes. If so change the program counter.
  if (cpu.Flags[flag] === test) {
    // Crossing a page boundary costs another cycle
    if (memory.OffsetCrossesPageBoundary(cpu.PC, offset)) {
      cpu.consumedCycles++;
    }
    cpu.PC += offset;
    cpu.consumedCycles++;
  }
}
