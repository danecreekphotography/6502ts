; 0105 - STY Zero Page plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sty $00,x  ; Positive number, X will be $01, A will be $42.
    sty $00,x  ; Zero, X will be $01, A will be $00.
    sty $00,x  ; Negative number, X will be $01, A will be %10010101.