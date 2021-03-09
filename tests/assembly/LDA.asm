; Verifies LDA with all applicable addressing modes
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
    lda #$42        ; Positive
    lda #$00        ; Zero
    lda #%10010101  ; Negative

    ; Zeropage. Starts with +1 to skip padding.
    lda zp + $01  ; Positive
    lda zp + $02  ; Zero
    lda zp + $03  ; Negative

    ; Zeropage plus X. X will be $01
    lda zp,x          ; Positive
    lda zp + $01,x    ; Zero
    lda zp + $02,x    ; Negative

    ; Absolute. Starts with +1 to skip padding.
    lda data + $01  ; Positive
    lda data + $02  ; Zero
    lda data + $03  ; Negative

    ; Absolute plus X. X will be $01.
    lda data,x          ; Positive
    lda data + $01,x    ; Zero
    lda data + $02,x    ; Negative
    lda data - $01,x    ; Positive across page boundary, x will be $02.
    lda data - $01,x    ; Zero across page boundary, x will be $03.

    ; Absolute plus Y. Y will be $01.
    lda data,y          ; Positive
    lda data + $01,y    ; Zero
    lda data + $02,y    ; Negative
    lda data - $01,y    ; Positive across page boundary, y will be $02.
    lda data - $01,y    ; Zero across page boundary, y will be $03.

    ; Indirect plus X. 
    lda (indirectX,x)   ; Positive. x will be $01.
    lda (indirectX,x)   ; Zero. x will be $03.
    lda (indirectX,x)   ; Negative. x will be $05.
    lda ($FF,x)         ; Positive, memory location wraps around zero page. x will be $06.

    ; Indirect plus Y.
    lda (indirectY),y        ; Positive. y will be $00.
    lda (indirectY),y        ; Zero. y will be $01.
    lda (indirectY),y        ; Negative. y will be $02.
    lda (indirectY + $02),y  ; Zero number page boundary case. y will be $01.