; Verifies LDX with all applicable addressing modes
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.segment "ZEROPAGE"

; Used for zero page address mode testing
zp:             
    .byte $00       ; Padding so remaining bytes can be accessed in zeropage plus tests
    .byte $42       ; Positive
    .byte $00       ; Zero
    .byte %10010101 ; Negative

; Used for indirect x address mode testing
indirectX:
    .byte $00           ; Padding so addresses can be accessed in plus x tests.
    .word data + $01    ; Start of actual test data
    .word data + $02    ; Zero
    .word data + $03    ; Negative

; Used for indirect y address mode testing
indirectY:
    .word data          ; Address of the actual test data start location
    .word data + $FF ; Used for the page boundary test

.data

data:

.byte $00       ; Padding so remaining bytes can be accessed in absolute plus tests
.byte $42       ; Positive
.byte $00       ; Zero
.byte %10010101 ; Negative
; Implicit here is that memory location data + $FF + $02 will be pre-filled with zeros.
; That location gets used to confirm the cycle count it takes to do an indirect Y
; across a page boundary.

.code

init:
    ; Immediate.
    ldx #$42        ; Positive
    ldx #$00        ; Zero
    ldx #%10010101  ; Negative

    ; Zeropage. Starts with +1 to skip padding.
    ldx zp + $01  ; Positive
    ldx zp + $02  ; Zero
    ldx zp + $03  ; Negative

    ; Zeropage plus Y. Y will be $01
    ldx zp,y          ; Positive
    ldx zp + $01,y    ; Zero
    ldx zp + $02,y    ; Negative

    ; Absolute. Starts with +1 to skip padding.
    ldx data + $01  ; Positive
    ldx data + $02  ; Zero
    ldx data + $03  ; Negative

    ; Absolute plus Y. Y will be $01.
    ldx data,y          ; Positive
    ldx data + $01,y    ; Zero
    ldx data + $02,y    ; Negative
    ldx data - $01,y    ; Positive across page boundary, y will be $02.
    ldx data - $01,y    ; Zero across page boundary, y will be $03.