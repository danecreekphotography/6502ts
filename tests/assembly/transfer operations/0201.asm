; 0200 - TAY
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    tay ; Positive number case, A will be $42.
    tay ; Zero number case, A will be $0.
    tay ; Negative number case, A will be %10010101.