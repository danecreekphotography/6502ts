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
}

export default Opcodes;
