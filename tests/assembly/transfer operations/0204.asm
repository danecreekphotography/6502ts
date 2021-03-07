; 0204 - TSX
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    tsx ; Positive number case, SP will be $41
    tsx ; Zero number case, SP will be $0.
    tsx ; Negative number case, SP will be %10010101.