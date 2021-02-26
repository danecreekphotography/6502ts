/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export default class CPU {
  /**
   * The program counter.
   */
  public PC: number;

  /**
   * The stack pointer.
   */
  public SP: number;

  public Registers: {
    A: number;
    X: number;
    Y: number;
  };

  /**
   * Initializes a new CPU.
   */
  constructor() {
    this.Initialize();
  }

  /**
   * Reset the CPU to its initial state, as if the power was just turned on.
   */
  public Initialize(): void {
    this.PC = 0x0000;
    this.SP = 0x0000;
    this.Registers = {
      A: 0,
      X: 0,
      Y: 0,
    };
  }
}
