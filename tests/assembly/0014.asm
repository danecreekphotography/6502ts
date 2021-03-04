; 0011 - LDA Absolute Plus X
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
    lda data,x          ; Positive number test, x will be $03
    lda data + $01,x    ; Zero test, x will be $03
    lda data + $02,x    ; Negative number test, x will be $03
    lda data - $03,x    ; Positive number across page boundary test, x will be $06
    lda data - $03,x    ; Zero across page boundary test, x will be $09