; 0100 - STA Zero Page
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sta $00  ; Positive number, A will be 0x42.
    sta $00  ; Zero, A will be 0x00.
    sta $00  ; Negative number, A will be 0b10010101.