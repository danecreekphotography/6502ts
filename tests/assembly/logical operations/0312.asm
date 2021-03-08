; 0304 - EOR absolute plus X
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

.byte $00
.byte %10000000

.code

init:
    eor data,x   ; Test negative, x will be $01.
    eor data,x   ; Test zero, x will be $01.
