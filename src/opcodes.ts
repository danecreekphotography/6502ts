/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import AddressModes from "./addressModes";
import ExecutionFunction from "./ExecutionFunction";
import * as jump from "./opcodes/jump";
import * as load from "./opcodes/load";
import * as logical from "./opcodes/logical";
import * as store from "./opcodes/store";
import * as system from "./opcodes/system";
import * as transfer from "./opcodes/transfer";

// Reference for all the opcodes: http://www.obelisk.me.uk/6502/reference.html
export enum Opcodes {
  LDA_Immediate = 0xa9,
  LDA_Zero_Page = 0xa5,
  LDA_Zero_PageX = 0xb5,
  LDA_Absolute = 0xad,
  LDA_AbsoluteX = 0xbd,
  LDA_AbsoluteY = 0xb9,
  LDA_IndirectX = 0xa1,
  LDA_IndirectY = 0xb1,

  LDX_Immediate = 0xa2,
  LDX_Zero_Page = 0xa6,
  LDX_Zero_PageY = 0xb6,
  LDX_Absolute = 0xae,
  LDX_AbsoluteY = 0xbe,

  LDY_Immediate = 0xa0,
  LDY_Zero_Page = 0xa4,
  LDY_Zero_PageX = 0xb4,
  LDY_Absolute = 0xac,
  LDY_AbsoluteX = 0xbc,

  JMP_Absolute = 0x4c,
  JPM_Indirect = 0x6c,

  STA_Zero_Page = 0x85,
  STX_Zero_Page = 0x86,
  STY_Zero_Page = 0x84,
  STA_Zero_PageX = 0x95,
  STY_Zero_PageX = 0x94,
  STX_Zero_PageY = 0x96,
  STA_Absolute = 0x8d,
  STX_Absolute = 0x8e,
  STY_Absolute = 0x8c,
  STA_AbsoluteX = 0x9d,
  STA_AbsoluteY = 0x99,
  STA_IndirectX = 0x81,
  STA_IndirectY = 0x91,

  TAX = 0xaa,
  TAY = 0xa8,
  TXA = 0x8a,
  TYA = 0x98,
  TSX = 0xba,
  TXS = 0x9a,

  AND_Immediate = 0x29,
  AND_Zeropage = 0x25,
  AND_ZeropageX = 0x35,
  AND_Absolute = 0x2d,
  AND_AbsoluteX = 0x3d,
  AND_AbsoluteY = 0x39,
  AND_IndirectX = 0x21,
  AND_IndirectY = 0x31,

  EOR_Immediate = 0x49,
  EOR_Zeropage = 0x45,
  EOR_ZeropageX = 0x55,
  EOR_Absolute = 0x4d,
  EOR_AbsoluteX = 0x5d,
  EOR_AbsoluteY = 0x59,
  EOR_IndirectX = 0x41,
  EOR_IndirectY = 0x51,

  ORA_Immediate = 0x09,
  ORA_Zeropage = 0x05,
  ORA_ZeropageX = 0x15,
  ORA_Absolute = 0x0d,
  ORA_AbsoluteX = 0x1d,
  ORA_AbsoluteY = 0x19,
  ORA_IndirectX = 0x01,
  ORA_IndirectY = 0x11,

  BIT_Zeropage = 0x24,
  BIT_Absolute = 0x2c,

  BRK = 0x00,
  NOP = 0xea,
  RTI = 0x40,
}

export const OpcodeFunctions = new Map<number, ExecutionFunction>([
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
  [0xaa, (cpu, memory) => transfer.TransferRegister(cpu, "A", "X")],
  [0xa8, (cpu, memory) => transfer.TransferRegister(cpu, "A", "Y")],
  [0x8a, (cpu, memory) => transfer.TransferRegister(cpu, "X", "A")],
  [0x98, (cpu, memory) => transfer.TransferRegister(cpu, "Y", "A")],
  [0xba, (cpu, memory) => transfer.TransferRegister(cpu, "SP", "X")],
  [0x9a, (cpu, memory) => transfer.TransferRegister(cpu, "X", "SP")],

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

  // BIT
  [0x24, (cpu, memory) => logical.bit(cpu, memory, AddressModes.ZeroPage)],
  [0x2c, (cpu, memory) => logical.bit(cpu, memory, AddressModes.Absolute)],

  // NOP
  [0xea, (cpu, memory) => system.nop(cpu, memory, AddressModes.Implied)],
]);
