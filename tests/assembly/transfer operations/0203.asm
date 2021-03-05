; 0203 - TYA
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    tya ; Positive number case, Y will be $42.
    tya ; Zero number case, Y will be $0.
    tya ; Negative number case, Y will be %10010101.