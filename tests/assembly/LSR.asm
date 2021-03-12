; Verifies LSR
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
    lsr         ; A will be %00000010
    lsr         ; A will be %00000001 from last instruction
    lsr         ; A will be %00000000 from last instruction
    lsr zp
    lsr zp,x    ; X will be $01
    lsr data
    lsr data,x  ; X will be $01

.segment "DATA"

data:
    .byte %00000010
    .byte %00000010