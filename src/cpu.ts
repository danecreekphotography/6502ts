/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "./addressModes";
import Flags, { FlagMask } from "./flags";
import Memory from "./memory";
import OpcodeFunctions from "./opcodes";
import Registers from "./registers";

export default class CPU {
  /**
   * Number of cycles consumed during operand execution.
   */
  public consumedCycles: number;

  /**
   * Location in memory where the reset vector is stored.
   */
  public readonly RESET_VECTOR = 0xfffc;

  /**
   * The program counter.
   */
  public PC: number;

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
    this.Registers.SP = 0x0000;
  }

  /**
   * Returns an address based on the specified addressMode. Assumes PC is pointed
   * to a location in memory with the base address.
   *
   * This consumes cycles based on the type of address mode provided.
   * @param memory Memory to read from
   * @param addressMode Address mode to use
   * @param pageBoundaryConsumesCycle True if crossing a page boundary should consume an extra cycle
   * @returns The address and a boolean indicating if a page boundary was crossed.
   */
  public CalculateAddressFromAddressMode(
    memory: Memory,
    addressMode: AddressModes,
    pageBoundaryConsumesCycle: boolean,
  ): number {
    let address = 0x00;

    switch (addressMode) {
      case AddressModes.ZeroPage:
      case AddressModes.ZeroPageX:
      case AddressModes.ZeroPageY: {
        address = memory.readByte(this.PC++);
        this.consumedCycles++;

        if (addressMode === AddressModes.ZeroPageX) {
          // Add RegisterX to get the actual address, but wrap it within the zero page address space.
          address = (address + this.Registers.X) & 0xff; // This forces it to wrap within the zero page address space
          this.consumedCycles++;
        }
        if (addressMode === AddressModes.ZeroPageY) {
          // Add RegisterY to get the actual address, but wrap it within the zero page address space.
          // I haven't found explicit documentation to say this happens with Zero Page Y but it kinda has to otherwise
          // the address mode makes no sense.
          address = (address + this.Registers.Y) & 0xff; // This forces it to wrap within the zero page address space
          this.consumedCycles++;
        }
        break;
      }

      // Read from the two byte address stored at the current program
      // counter location, adding in the offset from X or Y if appropriate.
      case AddressModes.Absolute:
      case AddressModes.AbsoluteX:
      case AddressModes.AbsoluteY: {
        address = memory.readWord(this.PC);
        this.PC += 2;
        this.consumedCycles += 2;

        // The AbsoluteX and AbsoluteY address modes only consume an extra cycle
        // if the base address + register cross a page boundary.
        if (addressMode === AddressModes.AbsoluteX) {
          if (pageBoundaryConsumesCycle && memory.OffsetCrossesPageBoundary(address, this.Registers.X)) {
            this.consumedCycles++;
          }
          address += this.Registers.X;
        }
        if (addressMode === AddressModes.AbsoluteY) {
          if (pageBoundaryConsumesCycle && memory.OffsetCrossesPageBoundary(address, this.Registers.Y)) {
            this.consumedCycles++;
          }
          address += this.Registers.Y;
        }
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
        address = memory.readWord(zeroPageAddress);
        this.consumedCycles += 2;
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
        address = baseAddress + this.Registers.Y;
        this.consumedCycles++;
        // Check and see if the addition crosses a page boundary
        if (pageBoundaryConsumesCycle && memory.OffsetCrossesPageBoundary(baseAddress, this.Registers.Y)) {
          this.consumedCycles++;
        }
        break;
      }

      default: {
        throw new Error("Unsupported address mode passed to CalculateAddressFromAddressMode()");
      }
    }
    return address;
  }

  /**
   * Reads a byte from memory using the specified access mode. Assumes PC is pointed
   * to a location in memory with either the value (AddressModes.Immediate)
   * or a memory location (all other address modes).
   * @param memory Memory to read from
   * @param addressMode Address mode to use
   */
  public ReadByteFromMemory(memory: Memory, addressMode: AddressModes): number {
    let data = 0x00;

    // Read directly from memory at the current program counter location.
    if (addressMode === AddressModes.Immediate) {
      data = memory.readByte(this.PC++);
      this.consumedCycles++;
    }
    // Read from the accumulator. Oddball case only used for some of the rotation operations
    else if (addressMode === AddressModes.Accumulator) {
      return this.Registers.A;
    }
    // Read from memory
    else {
      data = memory.readByte(this.CalculateAddressFromAddressMode(memory, addressMode, true));
      this.consumedCycles++;
    }

    return data;
  }

  /**
   * Returns the data at the requested location using the specified address mode
   * and the address it was read from. Handy to then update the data and write it back
   * to the same location in memory.
   * @param memory The memory to reference during execution.
   * @param addressMode The addressing mode to use when reading from memory.
   * @returns
   */
  public ReadByteAndAddress(memory: Memory, addressMode: AddressModes): [data: number, address: number] {
    let data = 0;
    let address = 0;

    if (addressMode === AddressModes.Accumulator) {
      data = this.Registers.A;
    } else {
      address = this.CalculateAddressFromAddressMode(memory, addressMode, false);
      data = memory.readByte(address);
    }

    return [data, address];
  }

  /**
   * Sets the Z and N flag based on the value stored in a register.
   * @param register The register to reference (A, X or Y).
   */
  public SetFlagsOnRegisterLoad(register: keyof Registers): void {
    // Zero flag is set if the register value is zero.
    this.Flags.Z = this.Registers[register] == 0;

    // Negative flag is set if the 7th bit in the register is one.
    this.Flags.N = (this.Registers[register] & 0b10000000) > 0;
  }

  /**
   * Pushes a word of data onto the stack. Consumes three cycles.
   * @param data The data to push onto the stack.
   */
  public StackPushWord(memory: Memory, data: number): void {
    // Decrement the stack pointer to move it into location to write the data.
    this.Registers.SP -= 2;
    this.consumedCycles++;

    // Store the data
    memory.writeWord(this.Registers.SP, data);
    this.consumedCycles += 2;
  }

  /**
   * Pops a word of data from the stack. Consumes three cycles.
   * @returns The data from the stack
   */
  public StackPopWord(memory: Memory): number {
    const data = memory.readWord(this.Registers.SP);
    this.consumedCycles += 2;

    // Increment the stack pointer.
    this.Registers.SP += 2;
    this.consumedCycles++;

    return data;
  }

  /**
   * Pushes a byte of data onto the stack. Consumes two cycles.
   * @param data The data to push onto the stack.
   */
  public StackPushByte(memory: Memory, data: number): void {
    // Decrement the stack pointer to move it into location to write the data.
    this.Registers.SP--;
    this.consumedCycles++;

    // Store the data
    memory.writeByte(this.Registers.SP, data);
    this.consumedCycles++;
  }

  /**
   * Pops a byte of data from the stack. Consumes two cycles.
   * @returns The data from the stack
   */
  public StackPopByte(memory: Memory): number {
    const data = memory.readByte(this.Registers.SP);
    this.consumedCycles++;

    // Increment the stack pointer.
    this.Registers.SP++;
    this.consumedCycles++;

    return data;
  }

  /**
   * Executes a given number of cycles reading from the supplied memory
   * @param cyclesToExecute The number of cycles to execute
   * @param memory The memory to reference during execution
   * @returns The number of cycles executed
   */
  public Execute(cyclesToExecute: number, memory: Memory): number {
    if (!this.PC) {
      throw new Error("Program counter is undefined. Did you remember to call Initialize()?");
    }

    this.consumedCycles = 0;

    while (this.consumedCycles < cyclesToExecute) {
      // Grab the opcode from memory, incrementing the program counter and consuming one cycle.
      const opcode = memory.readByte(this.PC++);
      this.consumedCycles++;

      // Look up the function to execute for the opcode and run it.
      if (OpcodeFunctions.has(opcode)) {
        OpcodeFunctions.get(opcode)(this, memory);
      } else {
        throw Error(`Read invalid opcode 0x${opcode.toString(16)} at memory address 0x${this.PC.toString(16)}.`);
      }
    }

    return this.consumedCycles;
  }
}
