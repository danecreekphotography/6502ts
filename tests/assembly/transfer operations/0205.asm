; 0205 - TXS
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    txs ; Positive number case, SP will be $41
    txs ; Zero number case, SP will be $0.
    txs ; Negative number case, SP will be %10010101.