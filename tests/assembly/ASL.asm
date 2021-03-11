; Verifies ASL
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

zp:

    .byte %00100000
    .byte %00100000

.code

init:
    asl         ; A will be %00100000
    asl         ; A will be %01000000 from last instruction
    asl         ; A will be %10000000 from last instruction
    asl zp
    asl zp,x    ; X will be $01
    asl data
    asl data,x  ; X will be $01

.segment "DATA"

data:
    .byte %00100000
    .byte %00100000