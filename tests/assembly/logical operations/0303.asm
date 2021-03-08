; 0303 - BIT immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

.byte %11000000

.code

init:
    bit data   ; Test overflow and negative
    bit data   ; Test zero
