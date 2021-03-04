; 0016 - LDA Indirect Plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.byte $00       ; Pad with an empty byte
.word data      ; Location of positive number
.word data + 1  ; Location of zero number
.word data + 2  ; Location of negative number

.data

data:

; Pad the first three positions with empty space so the X register can have
; a three in it for the test case.

.byte $42
.byte $00
.byte %10010101

.code

init:
    lda ($00,x) ; Positive non-zero number case, memory location doesn't wrap zero page. x will be $01.
    lda ($00,x) ; Zero number case, memory location doesn't wrap zero page. x will be $03.
    lda ($00,x) ; Negative number case, memory location doesn't wrap zero page. x will be $05.
    lda ($FF,x) ; Positive non-zero number case, memory location wraps zero page. x will be $02.