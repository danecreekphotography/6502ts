; 0301 - EOR zeropage
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.byte %10000000

.code

init:
    eor $00   ; Test negative
    eor $00   ; Test zero
