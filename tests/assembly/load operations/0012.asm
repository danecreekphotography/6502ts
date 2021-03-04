; 0012 - LDX Absolute
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
    ldx data
    ldx data + $01
    ldx data + $02