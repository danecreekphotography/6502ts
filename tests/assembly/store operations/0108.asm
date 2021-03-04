; 0108 - ST& Absolute
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sty $4000  ; Positive number, Y will be $42.
    sty $4000  ; Zero, Y will be $00.
    sty $4000  ; Negative number, Y will be %10010101.