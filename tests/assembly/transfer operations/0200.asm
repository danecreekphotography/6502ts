; 0200 - TAX
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    tax ; Positive number case, A will be $42.
    tax ; Zero number case, A will be $0.
    tax ; Negative number case, A will be %10010101.