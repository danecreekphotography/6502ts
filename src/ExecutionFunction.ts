/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import CPU from "./cpu";
import Memory from "./memory";

export default interface ExecutionFunction {
  (cpu: CPU, memory: Memory): void;
}
