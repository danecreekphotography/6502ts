; 0102 - STY Zero Page
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sty $00  ; Positive number, A will be 0x42.
    sty $00  ; Zero, A will be 0x00.
    sty $00  ; Negative number, A will be 0b10010101.