/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "./addressModes";
import ExecutionFunction from "./ExecutionFunction";
import * as branch from "./opcodes/branch";
import * as jump from "./opcodes/jump";
import * as load from "./opcodes/load";
import * as logical from "./opcodes/logical";
import * as store from "./opcodes/store";
import * as system from "./opcodes/system";
import * as transfer from "./opcodes/transfer";

// Reference for all the opcodes: http://www.obelisk.me.uk/6502/reference.html
const OpcodeFunctions = new Map<number, ExecutionFunction>([
  // LDA
  [0xa9, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.Immediate, "A")],
  [0xa5, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.ZeroPage, "A")],
  [0xb5, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.ZeroPageX, "A")],
  [0xad, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.Absolute, "A")],
  [0xbd, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.AbsoluteX, "A")],
  [0xb9, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.AbsoluteY, "A")],
  [0xa1, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.IndirectX, "A")],
  [0xb1, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.IndirectY, "A")],

  // LDX
  [0xa2, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.Immediate, "X")],
  [0xa6, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.ZeroPage, "X")],
  [0xb6, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.ZeroPageY, "X")],
  [0xae, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.Absolute, "X")],
  [0xbe, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.AbsoluteY, "X")],

  // LDY
  [0xa0, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.Immediate, "Y")],
  [0xa4, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.ZeroPage, "Y")],
  [0xb4, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.ZeroPageX, "Y")],
  [0xac, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.Absolute, "Y")],
  [0xbc, (cpu, memory) => load.LoadRegister(cpu, memory, AddressModes.AbsoluteX, "Y")],

  // STA
  [0x85, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.ZeroPage, "A")],
  [0x95, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.ZeroPageX, "A")],
  [0x8d, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.Absolute, "A")],
  [0x9d, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.AbsoluteX, "A")],
  [0x99, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.AbsoluteY, "A")],
  [0x81, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.IndirectX, "A")],
  [0x91, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.IndirectY, "A")],

  // STX
  [0x86, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.ZeroPage, "X")],
  [0x96, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.ZeroPageY, "X")],
  [0x8e, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.Absolute, "X")],

  // STY
  [0x84, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.ZeroPage, "Y")],
  [0x94, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.ZeroPageX, "Y")],
  [0x8c, (cpu, memory) => store.StoreRegister(cpu, memory, AddressModes.Absolute, "Y")],

  // TAX, TAY, TXA, TYA, TSX, TXS
  [0xaa, (cpu) => transfer.TransferRegister(cpu, "A", "X")],
  [0xa8, (cpu) => transfer.TransferRegister(cpu, "A", "Y")],
  [0x8a, (cpu) => transfer.TransferRegister(cpu, "X", "A")],
  [0x98, (cpu) => transfer.TransferRegister(cpu, "Y", "A")],
  [0xba, (cpu) => transfer.TransferRegister(cpu, "SP", "X")],
  [0x9a, (cpu) => transfer.TransferRegister(cpu, "X", "SP")],

  // AND
  [0x29, (cpu, memory) => logical.and(cpu, memory, AddressModes.Immediate)],
  [0x25, (cpu, memory) => logical.and(cpu, memory, AddressModes.ZeroPage)],
  [0x35, (cpu, memory) => logical.and(cpu, memory, AddressModes.ZeroPageX)],
  [0x2d, (cpu, memory) => logical.and(cpu, memory, AddressModes.Absolute)],
  [0x3d, (cpu, memory) => logical.and(cpu, memory, AddressModes.AbsoluteX)],
  [0x39, (cpu, memory) => logical.and(cpu, memory, AddressModes.AbsoluteY)],
  [0x21, (cpu, memory) => logical.and(cpu, memory, AddressModes.IndirectX)],
  [0x31, (cpu, memory) => logical.and(cpu, memory, AddressModes.IndirectY)],

  // EOR
  [0x49, (cpu, memory) => logical.eor(cpu, memory, AddressModes.Immediate)],
  [0x45, (cpu, memory) => logical.eor(cpu, memory, AddressModes.ZeroPage)],
  [0x55, (cpu, memory) => logical.eor(cpu, memory, AddressModes.ZeroPageX)],
  [0x4d, (cpu, memory) => logical.eor(cpu, memory, AddressModes.Absolute)],
  [0x5d, (cpu, memory) => logical.eor(cpu, memory, AddressModes.AbsoluteX)],
  [0x59, (cpu, memory) => logical.eor(cpu, memory, AddressModes.AbsoluteY)],
  [0x41, (cpu, memory) => logical.eor(cpu, memory, AddressModes.IndirectX)],
  [0x51, (cpu, memory) => logical.eor(cpu, memory, AddressModes.IndirectY)],

  // ORA
  [0x09, (cpu, memory) => logical.ora(cpu, memory, AddressModes.Immediate)],
  [0x05, (cpu, memory) => logical.ora(cpu, memory, AddressModes.ZeroPage)],
  [0x15, (cpu, memory) => logical.ora(cpu, memory, AddressModes.ZeroPageX)],
  [0x0d, (cpu, memory) => logical.ora(cpu, memory, AddressModes.Absolute)],
  [0x1d, (cpu, memory) => logical.ora(cpu, memory, AddressModes.AbsoluteX)],
  [0x19, (cpu, memory) => logical.ora(cpu, memory, AddressModes.AbsoluteY)],
  [0x01, (cpu, memory) => logical.ora(cpu, memory, AddressModes.IndirectX)],
  [0x11, (cpu, memory) => logical.ora(cpu, memory, AddressModes.IndirectY)],

  // JMP
  [0x4c, (cpu, memory) => jump.jmp(cpu, memory, AddressModes.Absolute)],
  [0x6c, (cpu, memory) => jump.jmp(cpu, memory, AddressModes.Indirect)],

  // JSR
  [0x20, (cpu, memory) => jump.jsr(cpu, memory, AddressModes.Absolute)],

  // RTS
  [0x60, (cpu, memory) => jump.rts(cpu, memory, AddressModes.Implied)],

  // BIT
  [0x24, (cpu, memory) => logical.bit(cpu, memory, AddressModes.ZeroPage)],
  [0x2c, (cpu, memory) => logical.bit(cpu, memory, AddressModes.Absolute)],

  // NOP
  [0xea, (cpu, memory) => system.nop(cpu, memory, AddressModes.Implied)],

  // BCS, BCC
  [0xb0, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "C", true)],
  [0x90, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "C", false)],

  // BEQ, BNE
  [0xf0, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "Z", true)],
  [0xd0, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "Z", false)],

  // BMI, BPL
  [0x30, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "N", true)],
  [0x10, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "N", false)],

  // BVC, BVS
  [0x50, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "V", false)],
  [0x70, (cpu, memory) => branch.branch(cpu, memory, AddressModes.Relative, "V", true)],
]);

export default OpcodeFunctions;
