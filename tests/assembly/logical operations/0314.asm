; 0306 - EOR Indirect Plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.byte $00       ; Pad with an empty byte
.word data      ; Location of the number

.data

data:

.byte %10000000

.code

init:
    eor ($00,x) ; Negative number case. x will be $01.
    eor ($00,x) ; Zero number case. x will be $01.
