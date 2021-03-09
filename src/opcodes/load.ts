/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "../addressModes";
import CPU from "../cpu";
import Memory from "../memory";
import Registers from "../registers";

/**
 * Loads the specified register with data using the requested addressMode.
 * @param cpu The CPU to use when executing the command.
 * @param memory Memory to write the data to.
 * @param addressMode Address mode to use to find the storage location in memory.
 * @param register The register to load the data into.
 */
export function LoadRegister(cpu: CPU, memory: Memory, addressMode: AddressModes, register: keyof Registers): void {
  cpu.Registers[register] = cpu.ReadByteFromMemory(memory, addressMode);
  cpu.SetFlagsOnRegisterLoad(register);
}
