; 0002 - STA Immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    lda #$42
    lda #$00
    lda #%10010101