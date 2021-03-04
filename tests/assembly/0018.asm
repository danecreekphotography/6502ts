; 0018 - LDA Indirect Plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.word data ; Tests will add Y register to this value.

.data

data:

; Pad the first three positions with empty space so the X register can have
; a three in it for the test case.

.byte $42
.byte $00
.byte %10010101

.code

init:
    lda ($00),y ; Positive non-zero number case, memory location doesn't wrap zero page. x will be $00.
    lda ($00),y ; Zero number case, memory location doesn't wrap zero page. x will be $01.
    lda ($00),y ; Negative number case, memory location doesn't wrap zero page. x will be $02.