/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "./cpu";
import Memory from "./memory";
import Opcodes from "./opcodes";

const cpu = new CPU();
const memory = new Memory();

memory.writeByte(cpu.RESET_VECTOR, Opcodes.LDA_Absolute);
memory.writeWord(cpu.RESET_VECTOR + 1, 0x2040);

// Positive non-zero number case
memory.writeByte(0x2040, 0x42);

cpu.Execute(3, memory);
