; 0009 - LDX Zero Page + Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

; Pad the first three positions with empty space so the Y register can have
; a three in it for the test case.
.byte $00
.byte $00
.byte $00
.byte $42
.byte $00
.byte %10010101

.code

init:
    ldx $00,y
    ldx $01,y
    ldx $02,y