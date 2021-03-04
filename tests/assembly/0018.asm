; 0018 - LDA Indirect Plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.word data       ; Tests will add Y register to this value.
.word data + $FF ; Used for the page boundary test.

.data

data:

; Pad the first three positions with empty space so the X register can have
; a three in it for the test case.

.byte $42
.byte $00
.byte %10010101
; Implicit here is that memory location data + $FF + $02 will be pre-filled with zeros.
; That location gets used to confirm the cycle count it takes to do an indirect Y
; across a page boundary.

.code

init:
    lda ($00),y ; Positive non-zero number case, memory location doesn't wrap zero page. y will be $00.
    lda ($00),y ; Zero number case, memory location doesn't wrap zero page. y will be $01.
    lda ($00),y ; Negative number case, memory location doesn't wrap zero page. y will be $02.
    lda ($02),y ; Zero number page boundary case. y will be $01.
