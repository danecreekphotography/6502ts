; Verifies INC
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

; Used for zero page address mode testing
zp:             
  .byte %00000000
  .byte $FF
  .byte %01111111

zpx:
  .byte $00 ; Padding
  .byte %00000001
  .byte $FF
  .byte %01111111

.code

init:
  inc zp
  inc zp + 1
  inc zp + 2

  inc zp,x  ; x will be $01
  inc zp,x  ; x will be $02
  inc zp,x  ; x will be $03

  inc data
  inc data + 1
  inc data + 2

  inc data,x  ; x will be $01
  inc data,x  ; x will be $02
  inc data,x  ; x will be $03

.segment "DATA"

data:

  .byte %00000001
  .byte $FF
  .byte %01111111

datax:

  .byte %00000001
  .byte $FF
  .byte %01111111