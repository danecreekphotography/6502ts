; 0016 - LDY Absolute Plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

; Pad the first three positions with empty space so the X register can have
; a three in it for the test case.

.byte $00
.byte $00
.byte $00
.byte $42
.byte $00
.byte %10010101

.code

init:
    ldy data,x
    ldy data + $01,x
    ldy data + $02,x
