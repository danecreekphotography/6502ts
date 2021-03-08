; EOR - EOR immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    eor #%10000000   ; Test negative
    eor #%10000000   ; Test zero
