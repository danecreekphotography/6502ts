/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export enum FlagMask {
  C = 1,
  Z = 2,
  I = 4,
  D = 8,
  B = 16,
  Unused = 32,
  V = 64,
  N = 128,
}

/**
 * Flags for the 6502 CPU.
 */
export default class Flags {
  /**
   * Carry
   */
  public C = false;

  /**
   * Zero flag
   */
  public Z = false;

  /**
   * Interrupt disable
   */
  public I = false;

  /**
   * Decimal mode
   */
  public D = false;

  /**
   * Break
   */
  public B = false;

  /**
   * Bit 5, unused
   */
  public Unused = true;

  /**
   * Overflow
   */
  public V = false;

  /**
   * Negative
   */
  public N = false;

  /**
   * Returns all the status flags as a single word with each bit representing one of the flag values.
   * Bit order:
   * N V Unused B D I Z C
   */
  public get Status(): number {
    return (
      (+!!this.N << 7) |
      (+!!this.V << 6) |
      (+!!this.Unused << 5) |
      (+!!this.B << 4) |
      (+!!this.D << 3) |
      (+!!this.I << 2) |
      (+!!this.Z << 1) |
      +!!this.C
    );
  }

  public set Status(flags: number) {
    this.C = (flags & FlagMask.C) > 0;
    this.Z = (flags & FlagMask.Z) > 0;
    this.I = (flags & FlagMask.I) > 0;
    this.D = (flags & FlagMask.D) > 0;
    this.B = (flags & FlagMask.B) > 0;
    this.Unused = (flags & FlagMask.Unused) > 0;
    this.V = (flags & FlagMask.V) > 0;
    this.N = (flags & FlagMask.N) > 0;
  }
}
