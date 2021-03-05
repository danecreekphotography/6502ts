; 0202 - TXA
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    txa ; Positive number case, X will be $42.
    txa ; Zero number case, X will be $0.
    txa ; Negative number case, X will be %10010101.