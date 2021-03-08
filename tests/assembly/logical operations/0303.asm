; 0303 - AND absolute
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

.byte %10000000

.code

init:
    and data   ; Test negative
    and data   ; Test zero
