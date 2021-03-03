; 0005 - LDX Zero Page
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
    ldx $00
    ldx $01
    ldx $02