; Verifies INX and INY
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
  inx   ; X will be 0b00000000
  iny   ; Y will be 0b00000000