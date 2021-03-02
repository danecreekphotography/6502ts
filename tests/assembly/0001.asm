.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    lda #$42