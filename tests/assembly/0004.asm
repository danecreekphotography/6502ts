; 0004 - STY Immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    ldy #$42
    ldy #$00
    ldy #%10010101