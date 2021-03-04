; 0100 - STX Zero Page
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    stx $00  ; Positive number, A will be 0x42.
    stx $00  ; Zero, A will be 0x00.
    stx $00  ; Negative number, A will be 0b10010101.