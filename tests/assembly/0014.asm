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
    lda data,x
    lda data + $01,x
    lda data + $02,x