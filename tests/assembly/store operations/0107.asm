; 0107 - STX Absolute
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    stx $4000  ; Positive number, X will be $42.
    stx $4000  ; Zero, X will be $00.
    stx $4000  ; Negative number, X will be %10010101.