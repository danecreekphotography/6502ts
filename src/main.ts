/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "./cpu";
import Memory from "./memory";
import Opcodes from "./opcodes";

const cpu = new CPU();
const memory = new Memory();

memory.write(cpu.RESET_VECTOR, Opcodes.LDA_Absolute);
memory.write(cpu.RESET_VECTOR + 1, 0x20);
memory.write(cpu.RESET_VECTOR + 2, 0x40);

// Positive non-zero number case
memory.write(0x2040, 0x42);

cpu.Execute(3, memory);
