; 0008 - LDA Zero Page + X
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
    lda $00,x
    lda $01,x
    lda $02,x