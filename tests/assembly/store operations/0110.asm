; 0110 - STA Absolute plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    sta $4000,y  ; Positive number, Y will be $01, A will be $42.
    sta $4000,y  ; Zero, Y will be $01, A will be $00.
    sta $4000,y  ; Negative number, Y will be $01, A will be %10010101.