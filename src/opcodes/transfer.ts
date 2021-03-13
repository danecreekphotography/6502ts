/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "../cpu";
import Registers from "../registers";

/**
 * Transfers data from one register to another, setting the zero and negative
 * flags based on the resulting value in the destination register.
 * @param cpu The CPU to use when executing the command.
 * @param sourceRegister The register to read the data from.
 * @param destinationRegister The register to store the data in.
 */
export function TransferRegister(
  cpu: CPU,
  sourceRegister: keyof Registers,
  destinationRegister: keyof Registers,
): void {
  cpu.Registers[destinationRegister] = cpu.Registers[sourceRegister];
  cpu.consumedCycles++;

  // Flags only get set on transfers to A, X, and Y registers.
  if (destinationRegister != "SP") {
    cpu.SetZAndNFlag(cpu.Registers[destinationRegister]);
  }
}
