; 0111 - STA Indirect Plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.byte $00   ; Pad with an empty byte
.word $3000   ; Location of positive number

.code

init:
    sta ($00,x) ; Positive non-zero number case, memory location doesn't wrap zero page. x will be $01.
    sta ($00,x) ; Zero number case, memory location doesn't wrap zero page. x will be $01.
    sta ($00,x) ; Negative number case, memory location doesn't wrap zero page. x will be $01.
    sta ($FF,x) ; Positive non-zero number case, memory location wraps zero page. x will be $02.