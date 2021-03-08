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
  private ReadDataFromMemory(memory: Memory, addressMode: AddressModes): number {
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
   * Loads the specified register with data using the requested addressMode.
   * @param memory The memory containing the data
   * @param register The register to load the data into
   * @param addressMode The addressMode to use when reading the data
   */
  private LoadRegister(memory: Memory, register: keyof Registers, addressMode: AddressModes): void {
    this.Registers[register] = this.ReadDataFromMemory(memory, addressMode);
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
   * Stores data from memory in the specified register.
   * @param memory Memory to read the data from
   * @param register Register to store the data in
   * @param addressMode Address mode to use to find the data
   */
  private StoreRegister(memory: Memory, register: keyof Registers, addressMode: AddressModes) {
    const dataAddress = this.CalculateAddressFromAddressMode(memory, addressMode, false);

    // Storing using any of these indirect modes consumes an additional cycle for some reason
    if (
      addressMode === AddressModes.AbsoluteX ||
      addressMode === AddressModes.AbsoluteY ||
      addressMode === AddressModes.IndirectY
    ) {
      this.consumedCycles++;
    }
    memory.writeByte(dataAddress, this.Registers[register]);
    this.consumedCycles++;
  }

  /**
   * Transfers data from one register to another, setting the zero and negative
   * flags based on the resulting value in the destination register.
   * @param sourceRegister The register to read the data from.
   * @param destinationRegister The register to store the data in.
   */
  private TransferRegister(sourceRegister: keyof Registers, destinationRegister: keyof Registers) {
    this.Registers[destinationRegister] = this.Registers[sourceRegister];
    this.consumedCycles++;

    // Flags only get set on transfers to A, X, and Y registers.
    if (destinationRegister != "SP") {
      this.SetFlagsOnRegisterLoad(destinationRegister);
    }
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
   * Executes the AND operand, reading the value to compare using the specified address mode.
   * @param memory The memory to reference during execution
   * @param addressMode The addressing mode to use when reading from memory
   */
  private LogicalAnd(memory: Memory, addressMode: AddressModes): void {
    this.Registers.A &= this.ReadDataFromMemory(memory, addressMode);
    this.SetFlagsOnRegisterLoad("A");
  }

  /**
   * Executes the EOR operand, reading the value to compare using the specified address mode.
   * @param memory The memory to reference during execution
   * @param addressMode The addressing mode to use when reading from memory
   */
  private LogicalEor(memory: Memory, addressMode: AddressModes): void {
    this.Registers.A ^= this.ReadDataFromMemory(memory, addressMode);
    this.SetFlagsOnRegisterLoad("A");
  }

  /**
   * Executes the BIT operand, reading the value to compare using the specified address mode.
   * @param memory The memory to reference during execution
   * @param addressMode The addressing mode to use when reading from memory
   */
  private LogicalBit(memory: Memory, addressMode: AddressModes): void {
    const data = this.ReadDataFromMemory(memory, addressMode);

    this.Flags.N = (data & FlagMask.N) > 0;
    this.Flags.V = (data & FlagMask.V) > 0;
    this.Flags.Z = (data & this.Registers.A) === 0;
  }

  /**
   * Executes the ORA operand, reading the value to compare using the specified address mode.
   * @param memory The memory to reference during execution
   * @param addressMode The addressing mode to use when reading from memory
   */
  private LogicalOra(memory: Memory, addressMode: AddressModes): void {
    this.Registers.A |= this.ReadDataFromMemory(memory, addressMode);
    this.SetFlagsOnRegisterLoad("A");
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

        case Opcodes.JMP_Absolute: {
          this.Jump(memory, AddressModes.Absolute);
          break;
        }
        case Opcodes.JPM_Indirect: {
          this.Jump(memory, AddressModes.Indirect);
          break;
        }

        case Opcodes.STA_Zero_Page: {
          this.StoreRegister(memory, "A", AddressModes.ZeroPage);
          break;
        }
        case Opcodes.STX_Zero_Page: {
          this.StoreRegister(memory, "X", AddressModes.ZeroPage);
          break;
        }
        case Opcodes.STY_Zero_Page: {
          this.StoreRegister(memory, "Y", AddressModes.ZeroPage);
          break;
        }

        case Opcodes.STA_Zero_PageX: {
          this.StoreRegister(memory, "A", AddressModes.ZeroPageX);
          break;
        }
        case Opcodes.STX_Zero_PageY: {
          this.StoreRegister(memory, "X", AddressModes.ZeroPageY);
          break;
        }
        case Opcodes.STY_Zero_PageX: {
          this.StoreRegister(memory, "Y", AddressModes.ZeroPageX);
          break;
        }

        case Opcodes.STA_Absolute: {
          this.StoreRegister(memory, "A", AddressModes.Absolute);
          break;
        }
        case Opcodes.STX_Absolute: {
          this.StoreRegister(memory, "X", AddressModes.Absolute);
          break;
        }
        case Opcodes.STY_Absolute: {
          this.StoreRegister(memory, "Y", AddressModes.Absolute);
          break;
        }
        case Opcodes.STA_AbsoluteX: {
          this.StoreRegister(memory, "A", AddressModes.AbsoluteX);
          break;
        }
        case Opcodes.STA_AbsoluteY: {
          this.StoreRegister(memory, "A", AddressModes.AbsoluteY);
          break;
        }
        case Opcodes.STA_IndirectX: {
          this.StoreRegister(memory, "A", AddressModes.IndirectX);
          break;
        }
        case Opcodes.STA_IndirectY: {
          this.StoreRegister(memory, "A", AddressModes.IndirectY);
          break;
        }

        case Opcodes.TAX: {
          this.TransferRegister("A", "X");
          break;
        }
        case Opcodes.TAY: {
          this.TransferRegister("A", "Y");
          break;
        }
        case Opcodes.TXA: {
          this.TransferRegister("X", "A");
          break;
        }
        case Opcodes.TYA: {
          this.TransferRegister("Y", "A");
          break;
        }
        case Opcodes.TSX: {
          this.TransferRegister("SP", "X");
          break;
        }
        case Opcodes.TXS: {
          this.TransferRegister("X", "SP");
          break;
        }

        case Opcodes.AND_Immediate: {
          this.LogicalAnd(memory, AddressModes.Immediate);
          break;
        }
        case Opcodes.AND_Zeropage: {
          this.LogicalAnd(memory, AddressModes.ZeroPage);
          break;
        }
        case Opcodes.AND_ZeropageX: {
          this.LogicalAnd(memory, AddressModes.ZeroPageX);
          break;
        }
        case Opcodes.AND_Absolute: {
          this.LogicalAnd(memory, AddressModes.Absolute);
          break;
        }
        case Opcodes.AND_AbsoluteX: {
          this.LogicalAnd(memory, AddressModes.AbsoluteX);
          break;
        }
        case Opcodes.AND_AbsoluteY: {
          this.LogicalAnd(memory, AddressModes.AbsoluteY);
          break;
        }
        case Opcodes.AND_IndirectX: {
          this.LogicalAnd(memory, AddressModes.IndirectX);
          break;
        }
        case Opcodes.AND_IndirectY: {
          this.LogicalAnd(memory, AddressModes.IndirectY);
          break;
        }

        case Opcodes.EOR_Immediate: {
          this.LogicalEor(memory, AddressModes.Immediate);
          break;
        }
        case Opcodes.EOR_Zeropage: {
          this.LogicalEor(memory, AddressModes.ZeroPage);
          break;
        }
        case Opcodes.EOR_ZeropageX: {
          this.LogicalEor(memory, AddressModes.ZeroPageX);
          break;
        }
        case Opcodes.EOR_Absolute: {
          this.LogicalEor(memory, AddressModes.Absolute);
          break;
        }
        case Opcodes.EOR_AbsoluteX: {
          this.LogicalEor(memory, AddressModes.AbsoluteX);
          break;
        }
        case Opcodes.EOR_AbsoluteY: {
          this.LogicalEor(memory, AddressModes.AbsoluteY);
          break;
        }
        case Opcodes.EOR_IndirectX: {
          this.LogicalEor(memory, AddressModes.IndirectX);
          break;
        }
        case Opcodes.EOR_IndirectY: {
          this.LogicalEor(memory, AddressModes.IndirectY);
          break;
        }

        case Opcodes.ORA_Immediate: {
          this.LogicalOra(memory, AddressModes.Immediate);
          break;
        }
        case Opcodes.ORA_Zeropage: {
          this.LogicalOra(memory, AddressModes.ZeroPage);
          break;
        }
        case Opcodes.ORA_ZeropageX: {
          this.LogicalOra(memory, AddressModes.ZeroPageX);
          break;
        }
        case Opcodes.ORA_Absolute: {
          this.LogicalOra(memory, AddressModes.Absolute);
          break;
        }
        case Opcodes.ORA_AbsoluteX: {
          this.LogicalOra(memory, AddressModes.AbsoluteX);
          break;
        }
        case Opcodes.ORA_AbsoluteY: {
          this.LogicalOra(memory, AddressModes.AbsoluteY);
          break;
        }
        case Opcodes.ORA_IndirectX: {
          this.LogicalOra(memory, AddressModes.IndirectX);
          break;
        }
        case Opcodes.ORA_IndirectY: {
          this.LogicalOra(memory, AddressModes.IndirectY);
          break;
        }

        case Opcodes.BIT_Zeropage: {
          this.LogicalBit(memory, AddressModes.ZeroPage);
          break;
        }
        case Opcodes.BIT_Absolute: {
          this.LogicalBit(memory, AddressModes.Absolute);
          break;
        }

        case Opcodes.NOP: {
          const opcodeFunction = OpcodeFunctions.get(opcode);
          opcodeFunction.execute(this, memory, opcodeFunction.addressMode);
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
