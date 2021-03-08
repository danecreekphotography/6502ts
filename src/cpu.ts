/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "./addressModes";
import Flags, { FlagMask } from "./flags";
import Memory from "./memory";
import { Opcodes, OpcodeFunctions } from "./opcodes";
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
   * Reads from memory using the specified access mode. Assumes PC is pointed
   * to a location in memory with either the value (AddressModes.Immediate)
   * or a memory location (all other address modes).
   * @param memory Memory to read from
   * @param addressMode Address mode to use
   */
  public ReadDataFromMemory(memory: Memory, addressMode: AddressModes): number {
    let data = 0x00;

    // Read directly from memory at the current program counter location.
    if (addressMode === AddressModes.Immediate) {
      data = memory.readByte(this.PC++);
      this.consumedCycles++;
    } else {
      data = memory.readByte(this.CalculateAddressFromAddressMode(memory, addressMode, true));
      this.consumedCycles++;
    }

    return data;
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
   * Updates the program counter to point to a different location in memory
   * @param memory The memory containing the location
   * @param addressMode The address mode to use when reading the location
   */
  private Jump(memory: Memory, addressMode: AddressModes): void {
    switch (addressMode) {
      case AddressModes.Absolute: {
        this.PC = memory.readWord(this.PC);
        this.consumedCycles += 2;
        break;
      }
      case AddressModes.Indirect: {
        // This gives us a two byte address in memory to read from.
        // We need to read two bytes of data from that address, but without wrapping across a page boundary.
        const indirectAddress = memory.readWord(this.PC);
        this.consumedCycles += 2;

        // Read the low byte data first since that's easy.
        const lowByteData = memory.readByte(indirectAddress);
        this.consumedCycles++;

        // The high byte comes from indirectAddress + 1, but does not
        // cross over a page boundary. Do some funky checks to ensure that's what happens
        let highByteDataAddress = 0;
        if ((indirectAddress & 0xff) == 0xff) {
          highByteDataAddress = indirectAddress & 0xff00;
        } else {
          highByteDataAddress = indirectAddress + 1;
        }
        const highByteData = memory.readByte(highByteDataAddress);
        this.consumedCycles++;

        // Set the program counter to the indirect address
        this.PC = (highByteData << 8) | lowByteData;
        this.consumedCycles++;
        break;
      }
    }
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
        case Opcodes.JMP_Absolute: {
          this.Jump(memory, AddressModes.Absolute);
          break;
        }
        case Opcodes.JPM_Indirect: {
          this.Jump(memory, AddressModes.Indirect);
          break;
        }

        case Opcodes.LDA_Immediate:
        case Opcodes.LDX_Immediate:
        case Opcodes.LDY_Immediate:
        case Opcodes.LDA_Zero_Page:
        case Opcodes.LDX_Zero_Page:
        case Opcodes.LDY_Zero_Page:
        case Opcodes.LDA_Zero_PageX:
        case Opcodes.LDX_Zero_PageY:
        case Opcodes.LDY_Zero_PageX:
        case Opcodes.LDA_Absolute:
        case Opcodes.LDX_Absolute:
        case Opcodes.LDY_Absolute:
        case Opcodes.LDA_AbsoluteX:
        case Opcodes.LDX_AbsoluteY:
        case Opcodes.LDY_AbsoluteX:
        case Opcodes.LDA_IndirectX:
        case Opcodes.LDA_IndirectY:
        case Opcodes.STA_Zero_Page:
        case Opcodes.STX_Zero_Page:
        case Opcodes.STY_Zero_Page:
        case Opcodes.STA_Zero_PageX:
        case Opcodes.STX_Zero_PageY:
        case Opcodes.STY_Zero_PageX:
        case Opcodes.STA_Absolute:
        case Opcodes.STX_Absolute:
        case Opcodes.STY_Absolute:
        case Opcodes.STA_AbsoluteX:
        case Opcodes.STA_AbsoluteY:
        case Opcodes.STA_IndirectX:
        case Opcodes.STA_IndirectY:
        case Opcodes.TAX:
        case Opcodes.TAY:
        case Opcodes.TXA:
        case Opcodes.TYA:
        case Opcodes.TSX:
        case Opcodes.TXS:
        case Opcodes.AND_Immediate:
        case Opcodes.AND_Zeropage:
        case Opcodes.AND_ZeropageX:
        case Opcodes.AND_Absolute:
        case Opcodes.AND_AbsoluteX:
        case Opcodes.AND_AbsoluteY:
        case Opcodes.AND_IndirectX:
        case Opcodes.AND_IndirectY:
        case Opcodes.EOR_Immediate:
        case Opcodes.EOR_Zeropage:
        case Opcodes.EOR_ZeropageX:
        case Opcodes.EOR_Absolute:
        case Opcodes.EOR_AbsoluteX:
        case Opcodes.EOR_AbsoluteY:
        case Opcodes.EOR_IndirectX:
        case Opcodes.EOR_IndirectY:
        case Opcodes.ORA_Immediate:
        case Opcodes.ORA_Zeropage:
        case Opcodes.ORA_ZeropageX:
        case Opcodes.ORA_Absolute:
        case Opcodes.ORA_AbsoluteX:
        case Opcodes.ORA_AbsoluteY:
        case Opcodes.ORA_IndirectX:
        case Opcodes.ORA_IndirectY:
        case Opcodes.BIT_Zeropage:
        case Opcodes.BIT_Absolute:
        case Opcodes.NOP: {
          OpcodeFunctions.get(opcode)(this, memory);
          break;
        }

        default: {
          throw Error(`Read invalid opcode 0x${opcode.toString(16)} at memory address 0x${this.PC.toString(16)}.`);
        }
      }
    }

    return this.consumedCycles;
  }
}
