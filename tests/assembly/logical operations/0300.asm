; 0300 - AND immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    and #%10000000   ; Test negative
    and #%10000000   ; Test zero
