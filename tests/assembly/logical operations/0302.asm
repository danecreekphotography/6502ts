; 0302 - AND zeropage plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.byte $00 ; Pad by one byte.
.byte %10000000

.code

init:
    and $00,x   ; Test negative, X will be 0x01.
    and $00,x   ; Test zero, X will be 0x01.
