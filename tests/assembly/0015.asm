; 0015 - LDX Absolute Plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

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
    ldx data,y
    ldx data + $01,y
    ldx data + $02,y