; Verifies DEC
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

; Used for zero page address mode testing
zp:             
  .byte %00000000
  .byte $00000001
  .byte %10000000

zpx:
  .byte $00 ; Padding
  .byte %00000000
  .byte $00000001
  .byte %10000000

.code

init:
  dec zp
  dec zp + 1
  dec zp + 2

  dec zpx,x  ; x will be $01
  dec zpx,x  ; x will be $02
  dec zpx,x  ; x will be $03

  dec data
  dec data + 1
  dec data + 2

  dec datax,x  ; x will be $01
  dec datax,x  ; x will be $02
  dec datax,x  ; x will be $03

.segment "DATA"

data:

  .byte %00000000
  .byte $00000001
  .byte %10000000

datax:

  .byte $00         ; Padding
  .byte %00000000
  .byte $00000001
  .byte %10000000