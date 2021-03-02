; 0001 - Verify load file
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    lda #$42