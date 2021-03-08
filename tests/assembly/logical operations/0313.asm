; 0305 - EOR absolute plus Y
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.data

data:

.byte $00
.byte %10000000

.code

init:
    eor data,y   ; Test negative, y will be $01.
    eor data,y   ; Test zero, y will be $01.
