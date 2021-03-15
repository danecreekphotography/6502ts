; Verifies INX and INY
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
  inx   ; X will be 0b00000000
  inx   ; X will be $FF
  inx   ; X will be 0b01111111

  iny   ; Y will be %b00000000
  iny   ; Y will be $FF
  iny   ; Y will be %b01111111
