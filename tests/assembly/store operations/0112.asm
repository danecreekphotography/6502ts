; 0112 - STA Indirect Plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

.word $3000   ; Location of number, y gets added to this

.code

init:
    sta ($00),y ; Positive non-zero number case, memory location doesn't wrap zero page. y will be $01.
    sta ($00),y ; Zero number case, memory location doesn't wrap zero page. y will be $01.
    sta ($00),y ; Negative number case, memory location doesn't wrap zero page. y will be $01.
