; 0010 - LDY Zero Page + X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

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
    ldy $00,x
    ldy $01,x
    ldy $02,x