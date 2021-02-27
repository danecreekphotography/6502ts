/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export default class Memory {
  public readonly MAX_ADDRESS = 0xffff;

  // Memory runs from 0x0000 to 0xffff so need a plus one on the array, otherwise
  // the length would be 0x0000 to 0xfffe since it's origin zero.
  private memory = Array<number>(this.MAX_ADDRESS + 1);

  /**
   * Verifies a memory address is within the memory's valid address range.
   * @param address The address to verify
   */
  private verifyAddressRange(address: number): void {
    if (address > this.MAX_ADDRESS) {
      throw new RangeError(
        `${address.toString(16)} is bigger than the memory's maximum address of ${this.MAX_ADDRESS.toString(16)}.`,
      );
    }
    if (address < 0) {
      throw new RangeError(`${address.toString(16)} is smaller than the memory's minimum address of 0x0000.`);
    }
  }

  /**
   * Reads a byte of data from memory. This takes one cycle.
   * @param address The address to read
   */
  public readByte(address: number): number {
    this.verifyAddressRange(address);
    return this.memory[address];
  }

  /**
   * Reads a word of data from memory. This takes two cycles.
   * @param address The address to read
   */
  public readWord(address: number): number {
    this.verifyAddressRange(address);
    this.verifyAddressRange(address + 1);

    const lowByte = this.memory[address++];
    const highByte = this.memory[address];
    return (highByte << 8) | lowByte;
  }

  /**
   * Writes a byte of data to memory. This takes one cycle.
   * @param address The address to write to
   * @param data The data to write
   */
  public writeByte(address: number, data: number): void {
    this.verifyAddressRange(address);
    this.memory[address] = data;
  }

  /**
   * Writes a word of data to memory. This takes two cycles.
   * @param address The address to write to
   * @param data The data to write
   */
  public writeWord(address: number, data: number): void {
    this.verifyAddressRange(address);
    this.verifyAddressRange(address + 1);

    this.memory[address++] = data & 0xff;
    this.memory[address] = data >> 8;
  }
}
