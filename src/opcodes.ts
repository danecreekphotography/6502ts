/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Reference for all the opcodes: http://www.obelisk.me.uk/6502/reference.html

enum Opcodes {
  LDA_Immediate = 0xa9,
  LDX_Immediate = 0xa2,
  LDY_Immediate = 0xa0,
  LDA_Zero_Page = 0xa5,
  LDX_Zero_Page = 0xa6,
  LDY_Zero_Page = 0xa4,
  LDA_Zero_PageX = 0xb5,
  LDX_Zero_PageY = 0xb6,
  LDY_Zero_PageX = 0xb4,
  LDA_Absolute = 0xad,
  LDX_Absolute = 0xae,
  LDY_Absolute = 0xac,
  LDA_AbsoluteX = 0xbd,
  LDA_AbsoluteY = 0xb9,
  LDX_AbsoluteY = 0xbe,
  LDY_AbsoluteX = 0xbc,
  LDA_IndirectX = 0xa1,
  LDA_IndirectY = 0xb1,

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
}

export default Opcodes;
