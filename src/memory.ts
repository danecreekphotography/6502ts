/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export default class Memory {
  public readonly MAX_ADDRESS = 0xffff;

  private memory = Array<number>(this.MAX_ADDRESS);

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
   * Reads a byte of data from memory
   * @param address The address to read
   */
  public read(address: number): number {
    this.verifyAddressRange(address);
    return this.memory[address];
  }

  /**
   * Writes a byte of data from memory
   * @param address The address to write to
   * @param data The data to write
   */
  public write(address: number, data: number): void {
    this.verifyAddressRange(address);
    this.memory[address] = data;
  }
}
