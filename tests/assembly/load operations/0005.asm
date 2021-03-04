; 0005 - LDA Zero Page
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.byte $42
.byte $00
.byte %10010101

.code

init:
    lda $00
    lda $01
    lda $02