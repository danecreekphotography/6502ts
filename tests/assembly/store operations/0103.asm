; 0103 - STA Zero Page plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sta $00,x  ; Positive number, X will be $01, A will be $42.
    sta $00,x  ; Zero, X will be $01, A will be $00.
    sta $00,x  ; Negative number, x will be $01, A will be %10010101.