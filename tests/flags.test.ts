/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Flags from "../src/flags";

test("Verify Flags constructor", () => {
    const flags = new Flags();

    expect(flags.B).toBe(false);
    expect(flags.C).toBe(false);
    expect(flags.D).toBe(false);
    expect(flags.I).toBe(false);
    expect(flags.N).toBe(false);
    expect(flags.Unused).toBe(true);
    expect(flags.V).toBe(false);
    expect(flags.Z).toBe(false);
    expect(flags.Status).toBe(0b00100000);
});

test("Verify Status property", () => {
    const flags = new Flags();

    flags.C = true;
    expect(flags.Status).toBe(0b00100001);

    flags.Z = true;
    expect(flags.Status).toBe(0b00100011);

    flags.I = true;
    expect(flags.Status).toBe(0b00100111);

    flags.D = true;
    expect(flags.Status).toBe(0b00101111);

    flags.B = true;
    expect(flags.Status).toBe(0b00111111);

    flags.V = true;
    expect(flags.Status).toBe(0b01111111);

    flags.N = true;
    expect(flags.Status).toBe(0b11111111);

})