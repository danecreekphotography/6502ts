; 0303 - EOR absolute
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

.byte %10000000

.code

init:
    eor data   ; Test negative
    eor data   ; Test zero
