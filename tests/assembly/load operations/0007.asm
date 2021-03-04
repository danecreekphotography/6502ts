; 0005 - LDY Zero Page
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
    ldy $00
    ldy $01
    ldy $02