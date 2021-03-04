; 0104 - STX Zero Page plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    stx $00,y  ; Positive number, Y will be $01, A will be $42.
    stx $00,y  ; Zero, Y will be $01, A will be $00.
    stx $00,y  ; Negative number, Y will be $01, A will be %10010101.