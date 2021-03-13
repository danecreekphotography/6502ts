; Verifies ROL
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

zp:

    .byte %01000000
    .byte %10000000

.code

init:
    rol         ; A will be %01000000, C will be 1.
    rol         ; A will be %10000001 from last instruction
    rol         ; A will be %00000010 from last instruction
    rol zp
    rol zp,x    ; X will be $01
    rol data
    rol data,x  ; X will be $01

.segment "DATA"

data:
    .byte %01000000
    .byte %10000000