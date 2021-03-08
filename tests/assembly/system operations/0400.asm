; 0400 - NOP
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
  nop
  nop
  nop