; 0302 - ORA immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    ora #%10000000   ; Test negative
    ora #%00000000   ; Test zero
