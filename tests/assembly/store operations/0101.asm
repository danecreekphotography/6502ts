; 0100 - STX Zero Page
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    stx $00  ; Positive number, A will be $42.
    stx $00  ; Zero, A will be $00.
    stx $00  ; Negative number, A will be %10010101.