; 0301 - AND zeropage
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.byte %10000000

.code

init:
    and $00   ; Test negative
    and $00   ; Test zero
