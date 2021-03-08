/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import Memory from "../memory";

/**
 * Updates the program counter to point to a different location in memory.
 * @param cpu The CPU to use when executing the command.
 * @param memory The memory containing the location.
 * @param addressMode The address mode to use when reading the location.
 */
export function jmp(cpu: CPU, memory: Memory, addressMode: AddressModes): void {
  switch (addressMode) {
    case AddressModes.Absolute: {
      cpu.PC = memory.readWord(cpu.PC);
      cpu.consumedCycles += 2;
      break;
    }
    case AddressModes.Indirect: {
      // This gives us a two byte address in memory to read from.
      // We need to read two bytes of data from that address, but without wrapping across a page boundary.
      const indirectAddress = memory.readWord(cpu.PC);
      cpu.consumedCycles += 2;

      // Read the low byte data first since that's easy.
      const lowByteData = memory.readByte(indirectAddress);
      cpu.consumedCycles++;

      // The high byte comes from indirectAddress + 1, but does not
      // cross over a page boundary. Do some funky checks to ensure that's what happens
      let highByteDataAddress = 0;
      if ((indirectAddress & 0xff) == 0xff) {
        highByteDataAddress = indirectAddress & 0xff00;
      } else {
        highByteDataAddress = indirectAddress + 1;
      }
      const highByteData = memory.readByte(highByteDataAddress);
      cpu.consumedCycles++;

      // Set the program counter to the indirect address
      cpu.PC = (highByteData << 8) | lowByteData;
      cpu.consumedCycles++;
      break;
    }
  }
}
