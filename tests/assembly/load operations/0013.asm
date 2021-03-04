; 0013 - LDY Absolute
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
    ldy data
    ldy data + $01
    ldy data + $02