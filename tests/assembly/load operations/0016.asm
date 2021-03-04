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
    ldy data,x          ; Positive number test, x will be $03
    ldy data + $01,x    ; Zero test, x will be $03
    ldy data + $02,x    ; Negative number test, x will be $03
    ldy data - $03,x    ; Positive number across page boundary test, x will be $06
    ldy data - $03,x    ; Zero test across page boundary, x will be $09