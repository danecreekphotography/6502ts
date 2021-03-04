; 0106 - STA Absolute
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sta $4000  ; Positive number, A will be $42.
    sta $4000  ; Zero, A will be $00.
    sta $4000  ; Negative number, A will be %10010101.