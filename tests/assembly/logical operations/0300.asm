; 0300 - AND immediate
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    and #%10000010   ; Negative and zero set
    and #%00000010   ; Zero set
    and #%10000000   ; Negative set
    and #%00000000   ; Neither set