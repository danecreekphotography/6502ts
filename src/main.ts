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
memory.write(cpu.RESET_VECTOR + 1, 0x80);
memory.write(0x80, 0x42);

// Positive non-zero number case
cpu.Execute(4, memory);
console.log(cpu.Registers.A.toString(16));
