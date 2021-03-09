; Verifies LDY with all applicable addressing modes
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
    ldy #$42        ; Positive
    ldy #$00        ; Zero
    ldy #%10010101  ; Negative

    ; Zeropage. Starts with +1 to skip padding.
    ldy zp + $01  ; Positive
    ldy zp + $02  ; Zero
    ldy zp + $03  ; Negative

    ; Zeropage plus X. X will be $01
    ldy zp,x          ; Positive
    ldy zp + $01,x    ; Zero
    ldy zp + $02,x    ; Negative

    ; Absolute. Starts with +1 to skip padding.
    ldy data + $01  ; Positive
    ldy data + $02  ; Zero
    ldy data + $03  ; Negative

    ; Absolute plus X. X will be $01.
    ldy data,x          ; Positive
    ldy data + $01,x    ; Zero
    ldy data + $02,x    ; Negative
    ldy data - $01,x    ; Positive across page boundary, y will be $02.
    ldy data - $01,x    ; Zero across page boundary, y will be $03.