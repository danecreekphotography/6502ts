; 0002 - STX Immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    ldx #$42
    ldx #$00
    ldx #%10010101