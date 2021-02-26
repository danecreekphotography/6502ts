/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Memory from "./memory";
import Opcodes from "./opcodes";
import Registers from "./registers";

export default class CPU {
  private consumedCycles: number;

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

  public Registers = new Registers();

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

  /**
   * Loads the data from memory at the current PC location into the specified
   * register.
   * Causes the program counter to increment by one and consumes one cycle.
   * @param register The register to load the data into
   * @param memory The memory containing the data
   */
  private LoadRegisterImmediate(register: keyof Registers, memory: Memory): void {
    this.Registers[register] = memory.read(this.PC++);
    this.consumedCycles++;
    this.SetFlagsOnRegisterLoad(register);
  }

  /**
   * Loads the zero page address from memory at the current PC location
   * then loads the data at the zero page address into the specified register.
   * Causes the program counter to increment by one and consumes two cycles.
   * @param register The register to load the data into
   * @param memory The memory containing the data
   */
  private LoadRegisterZeroPage(register: keyof Registers, memory: Memory): void {
    const zeroPageAddress = memory.read(this.PC++);
    this.consumedCycles++;
    this.Registers[register] = memory.read(zeroPageAddress);
    this.consumedCycles++;
    this.SetFlagsOnRegisterLoad(register);
  }

  /**
   * Sets the Z and N flag based on the value stored in a register.
   * @param register The register to reference (A, X or Y).
   */
  private SetFlagsOnRegisterLoad(register: keyof Registers): void {
    // Zero flag is set if the register value is zero.
    this.Flags.Z = this.Registers[register] == 0;

    // Negative flag is set if the 7th bit in the register is one.
    this.Flags.N = (this.Registers[register] & 0b10000000) > 0;
  }

  /**
   * Executes a given number of cycles reading from the supplied memory
   * @param cyclesToExecute The number of cycles to execute
   * @param memory The memory to reference during execution
   * @returns The number of cycles executed
   */
  public Execute(cyclesToExecute: number, memory: Memory): number {
    this.consumedCycles = 0;

    while (this.consumedCycles < cyclesToExecute) {
      // Grab the opcode from memory, incrementing the program counter
      // and consuming one cycle.
      const opcode = memory.read(this.PC++);
      this.consumedCycles++;

      switch (opcode) {
        case Opcodes.LDA_Immediate:
          this.LoadRegisterImmediate("A", memory);
          break;
        case Opcodes.LDX_Immediate:
          this.LoadRegisterImmediate("X", memory);
          break;
        case Opcodes.LDY_Immediate:
          this.LoadRegisterImmediate("Y", memory);
          break;
        case Opcodes.LDA_Zero_Page:
          this.LoadRegisterZeroPage("A", memory);
          break;
        case Opcodes.LDX_Zero_Page:
          this.LoadRegisterZeroPage("X", memory);
          break;
        case Opcodes.LDY_Zero_Page:
          this.LoadRegisterZeroPage("Y", memory);
          break;
      }
    }

    return this.consumedCycles;
  }
}
