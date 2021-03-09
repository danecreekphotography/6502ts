; Verifies LDA with all applicable addressing modes
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    ; Initialize the stack pointer
    ldx #$FF
    txs

main:
    lda #$42
    jsr subroutine
    ldx #$42

subroutine:

    ldy #$42
    rts