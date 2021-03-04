/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Memory from "../src/memory";

export function createMemoryFromTestRom(testCase: string): Memory {
    return new Memory(`${process.cwd()}/tests/roms/${testCase}`);
}