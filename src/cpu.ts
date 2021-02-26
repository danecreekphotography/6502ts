/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export default class CPU {
  /**
   * Location in memory where execution starts.
   */
  public readonly RESET_VECTOR = 0xfffc;

  /**
   * The program counter.
   */
  public PC: number;

  /**
   * The stack pointer.
   */
  public SP: number;

  public Registers: {
    /**
     * Accumulator
     */
    A: number;
    /**
     * X register
     */
    X: number;
    /**
     * Y register
     */
    Y: number;
  };

  public Flags: {
    /**
     * Carry flag
     */
    C: boolean;
    /**
     * Zero flag
     */
    Z: boolean;
    /**
     * Interrupt disable
     */
    I: boolean;
    /**
     * Decimal mode
     */
    D: boolean;
    /**
     * Break command
     */
    B: boolean;
    /**
     * Overflow flag
     */
    V: boolean;
    /**
     * Negative flag
     */
    N: boolean;
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
    this.PC = this.RESET_VECTOR;
    this.SP = 0x0000;
    this.Registers = {
      A: 0,
      X: 0,
      Y: 0,
    };
    this.Flags = {
      B: false,
      C: false,
      D: false,
      I: false,
      N: false,
      V: false,
      Z: false,
    };
  }
}
