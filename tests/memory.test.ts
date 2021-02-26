/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Memory from "../src/memory";

test("Verify read address bounds", () => {
  const memory = new Memory();

  expect(() => {
    memory.read(memory.MAX_ADDRESS + 1);
  }).toThrow(RangeError);
  expect(() => {
    memory.read(-1);
  }).toThrow(RangeError);
});

test("Verify write address bounds", () => {
  const memory = new Memory();

  expect(() => {
    memory.write(memory.MAX_ADDRESS + 1, 0);
  }).toThrow(RangeError);
  expect(() => {
    memory.write(-1, 0);
  }).toThrowError();
});

test("Verify read and write", () => {
  const memory = new Memory();

  memory.write(0x0000, 0x42);
  expect(memory.read(0x0000)).toBe(0x42);
});
