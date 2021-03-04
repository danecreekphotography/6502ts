; 0109 - STA Absolute plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sta $4000,x  ; Positive number, X will be $01, A will be $42.
    sta $4000,x  ; Zero, X will be $01, A will be $00.
    sta $4000,x  ; Negative number, X will be $01, A will be %10010101.