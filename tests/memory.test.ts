/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Memory from "../src/memory";

test("Verify read byte address bounds", () => {
  const memory = new Memory();

  expect(() => {
    memory.readByte(memory.MAX_ADDRESS + 1);
  }).toThrow(RangeError);
  expect(() => {
    memory.readByte(-1);
  }).toThrow(RangeError);
});

test("Verify read word address bounds", () => {
  const memory = new Memory();

  expect(() => {
    memory.readWord(memory.MAX_ADDRESS + 1);
  }).toThrow(RangeError);
  expect(() => {
    memory.readWord(-1);
  }).toThrow(RangeError);
});

test("Verify write word address bounds", () => {
  const memory = new Memory();

  expect(() => {
    memory.writeWord(memory.MAX_ADDRESS + 1, 0);
  }).toThrow(RangeError);
  expect(() => {
    memory.writeWord(-1, 0);
  }).toThrowError();
});

test("Verify write byte address bounds", () => {
  const memory = new Memory();

  expect(() => {
    memory.writeByte(memory.MAX_ADDRESS + 1, 0);
  }).toThrow(RangeError);
  expect(() => {
    memory.writeByte(-1, 0);
  }).toThrowError();
});
test("Verify read and write byte", () => {
  const memory = new Memory();

  memory.writeByte(0x0000, 0x42);
  expect(memory.readByte(0x0000)).toBe(0x42);
});

test("Verify read and write word", () => {
  const memory = new Memory();

  memory.writeWord(0x0000, 0x4221);
  expect(memory.readWord(0x0000)).toBe(0x4221);
});
