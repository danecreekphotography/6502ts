; Verifies ROR
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

zp:

    .byte %00000010
    .byte %00000001

.code

init:
    ror         ; A will be %00000010, C will be 1.
    ror         ; A will be %10000001 from last instruction
    ror         ; A will be %00000000 from last instruction
    ror zp
    ror zp,x    ; X will be $01
    ror data
    ror data,x  ; X will be $01

.segment "DATA"

data:
    .byte %00000010
    .byte %00000001