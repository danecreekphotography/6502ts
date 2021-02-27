/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "./addressModes";
import Flags from "./flags";
import Memory from "./memory";
import Opcodes from "./opcodes";
import Registers from "./registers";

export default class CPU {
  private consumedCycles: number;

  /**
   * Location in memory where the reset vector is stored.
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

  /**
   * The registers.
   */
  public Registers = new Registers();

  /**
   * The status flags
   */
  public Flags = new Flags();

  /**
   * Reset the CPU to its initial state, as if the power was just turned on.
   * @param memory The memory to use with the CPU. The address at the reset vector will get used to set the program counter's starting value.
   */
  public Initialize(memory: Memory): void {
    this.PC = memory.readWord(this.RESET_VECTOR);
    this.SP = 0x0000;
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
        data = memory.readByte(this.PC++);
        this.consumedCycles++;
        break;
      }

      // Read from the single byte memory address stored at the current program
      // counter location, adding in the offset from X or Y if appropriate.
      case AddressModes.ZeroPage:
      case AddressModes.ZeroPageX:
      case AddressModes.ZeroPageY: {
        let dataAddress = memory.readByte(this.PC++);
        this.consumedCycles++;

        if (addressMode === AddressModes.ZeroPageX) {
          dataAddress += this.Registers.X;
          this.consumedCycles++;
        }
        if (addressMode === AddressModes.ZeroPageY) {
          dataAddress += this.Registers.Y;
          this.consumedCycles++;
        }

        data = memory.readByte(dataAddress);
        this.consumedCycles++;
        break;
      }

      // Read from the two byte address stored at the current program
      // counter location, adding in the offset from X or Y if appropriate.
      case AddressModes.Absolute:
      case AddressModes.AbsoluteX:
      case AddressModes.AbsoluteY: {
        let dataAddress = memory.readWord(this.PC);
        this.PC += 2;
        this.consumedCycles += 2;

        // The AbsoluteX and AbsoluteY address modes only consume an extra cycle
        // if the base address + register cross a page boundary.
        if (addressMode === AddressModes.AbsoluteX) {
          dataAddress += this.Registers.X;
          if (memory.OffsetCrossesPageBoundary(dataAddress, this.Registers.X)) this.consumedCycles++;
        }
        if (addressMode === AddressModes.AbsoluteY) {
          dataAddress += this.Registers.Y;
          if (memory.OffsetCrossesPageBoundary(dataAddress, this.Registers.Y)) this.consumedCycles++;
        }

        data = memory.readByte(dataAddress);
        this.consumedCycles++;
        break;
      }

      // Read from the two byte address stored in the zero page plus offset location,
      // then use that as an address to read the actual data.
      case AddressModes.IndirectX: {
        // Start by getting the zero page address from the current program counter location.
        const baseZeroPageAddress = memory.readByte(this.PC++);
        this.consumedCycles++;
        // Add RegisterX to get the actual zero page address, but wrap it within the zero page address space.
        const zeroPageAddress = (baseZeroPageAddress + this.Registers.X) & 0xff; // This forces it to wrap within the zero page address space
        this.consumedCycles++;
        // Get the data address from the zero page memory location.
        const dataAddress = memory.readWord(zeroPageAddress);
        this.consumedCycles += 2;
        // Actually read the data.
        data = memory.readByte(dataAddress);
        this.consumedCycles++;
        break;
      }

      // Read from the two byte address stored in the zero page, add Y to that value,
      // then use that as an address to read the actual data.
      case AddressModes.IndirectY: {
        // Start by getting the zero page address from the current program counter location.
        const zeroPageAddress = memory.readByte(this.PC++);
        this.consumedCycles++;
        // Read the base address from the zero page location
        const baseAddress = memory.readWord(zeroPageAddress);
        this.consumedCycles += 1;
        // Add the value of the Y register.
        const dataAddress = baseAddress + this.Registers.Y;
        this.consumedCycles++;
        // Check and see if the addition crosses a page boundary
        if (memory.OffsetCrossesPageBoundary(baseAddress, this.Registers.Y)) this.consumedCycles++;
        // Actually read the data.
        data = memory.readByte(dataAddress);
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
      const opcode = memory.readByte(this.PC++);
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

        case Opcodes.LDA_AbsoluteX: {
          this.LoadRegister(memory, "A", AddressModes.AbsoluteX);
          break;
        }
        case Opcodes.LDX_AbsoluteY: {
          this.LoadRegister(memory, "X", AddressModes.AbsoluteY);
          break;
        }
        case Opcodes.LDY_AbsoluteX: {
          this.LoadRegister(memory, "Y", AddressModes.AbsoluteX);
          break;
        }

        case Opcodes.LDA_IndirectX: {
          this.LoadRegister(memory, "A", AddressModes.IndirectX);
          break;
        }
        case Opcodes.LDA_IndirectY: {
          this.LoadRegister(memory, "A", AddressModes.IndirectY);
          break;
        }

        default: {
          throw Error(`Read an invalid opcode at memory address 0x${this.PC.toString(16)}.`);
        }
      }
    }

    return this.consumedCycles;
  }
}
