/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "./addressModes";
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
   * Reads from memory using the specified access mode
   * @param memory Memory to read from
   * @param addressMode Address mode to use
   */
  private ReadDataViaAddressMode(memory: Memory, addressMode: AddressModes): number {
    let data = 0x00;

    switch (addressMode) {
      // Read directly from memory at the current program counter location.
      case AddressModes.Immediate: {
        data = memory.read(this.PC++);
        this.consumedCycles++;
        break;
      }
      // Read from the single byte memory address stored at the current program
      // counter location, adding in the offset from X or Y if appropriate.
      case AddressModes.ZeroPage:
      case AddressModes.ZeroPageX:
      case AddressModes.ZeroPageY: {
        let dataAddress = memory.read(this.PC++);
        this.consumedCycles++;

        if (addressMode === AddressModes.ZeroPageX) {
          dataAddress += this.Registers.X;
          this.consumedCycles++;
        }
        if (addressMode === AddressModes.ZeroPageY) {
          dataAddress += this.Registers.Y;
          this.consumedCycles++;
        }

        data = memory.read(dataAddress);
        this.consumedCycles++;
        break;
      }
    }

    return data;
  }

  /**
   * Loads the specified register with data using the requested addressMode.
   * @param memory The memory containing the data
   * @param register The register to load the data into
   * @param addressMode The addressMode to use when reading the data
   */
  private LoadRegister(memory: Memory, register: keyof Registers, addressMode: AddressModes): void {
    this.Registers[register] = this.ReadDataViaAddressMode(memory, addressMode);
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
          this.LoadRegister(memory, "A", AddressModes.Immediate);
          break;
        case Opcodes.LDX_Immediate:
          this.LoadRegister(memory, "X", AddressModes.Immediate);
          break;
        case Opcodes.LDY_Immediate:
          this.LoadRegister(memory, "Y", AddressModes.Immediate);
          break;

        case Opcodes.LDA_Zero_Page:
          this.LoadRegister(memory, "A", AddressModes.ZeroPage);
          break;
        case Opcodes.LDX_Zero_Page:
          this.LoadRegister(memory, "X", AddressModes.ZeroPage);
          break;
        case Opcodes.LDY_Zero_Page:
          this.LoadRegister(memory, "Y", AddressModes.ZeroPage);
          break;

        case Opcodes.LDA_Zero_PageX:
          this.LoadRegister(memory, "A", AddressModes.ZeroPageX);
          break;
        case Opcodes.LDX_Zero_PageY:
          this.LoadRegister(memory, "X", AddressModes.ZeroPageY);
          break;
        case Opcodes.LDY_Zero_PageX:
          this.LoadRegister(memory, "Y", AddressModes.ZeroPageX);
          break;

        case Opcodes.LDA_Absolute: {
          this.LoadRegister(memory, "A", AddressModes.Absolute);
          break;
        }
        case Opcodes.LDX_Absolute: {
          this.LoadRegister(memory, "X", AddressModes.Absolute);
          break;
        }
        case Opcodes.LDY_Absolute: {
          this.LoadRegister(memory, "Y", AddressModes.Absolute);
          break;
        }
      }
    }

    return this.consumedCycles;
  }
}
