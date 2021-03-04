; 0015 - LDX Absolute Plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

; Pad the first three positions with empty space so the Y register can have
; a three in it for the test case.

.byte $00
.byte $00
.byte $00
.byte $42
.byte $00
.byte %10010101

.code

init:
    ldx data,y          ; Positive number test, y will be $03
    ldx data + $01,y    ; Zero test, y will be $03
    ldx data + $02,y    ; Negative number test, y will be $03
    ldx data - $03,y    ; Positive number across page boundary test, y will be $06
    ldx data - $03,y    ; Zero test across page boundary test, y will be $09