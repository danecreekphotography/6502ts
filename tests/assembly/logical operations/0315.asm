; 0307 - EOR Indirect Plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.word data       ; Tests will add Y register to this value.

.data

data:

; Pad the position so the test case finds data in the second position

.byte $00
.byte %10000000

.code

init:
    eor ($00),y ; Negative number case. y will be $01.
    eor ($00),y ; Zero number case. y will be $01.
