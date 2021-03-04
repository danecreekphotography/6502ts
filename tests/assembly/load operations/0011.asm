; 0011 - LDA Absolute
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

.byte $42
.byte $00
.byte %10010101

.code

init:
    lda data
    lda data + $01
    lda data + $02