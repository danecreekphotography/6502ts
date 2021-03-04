; 0100 - STA Zero Page
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sta $00  ; Positive number, A will be $42.
    sta $00  ; Zero, A will be $00.
    sta $00  ; Negative number, A will be %10010101.