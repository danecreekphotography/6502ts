; Verifies BEQ and BNE
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
  beq handleBEQ  ; Zero flag will be false, no branch
  beq handleBEQ  ; Zero flag will be true, branch
  nop            ; Padding in memory so the offset isn't zero

handleBEQ:
  lda #$42       ; Load something to prove execution is here
  bne handleBNE  ; Zero flag will be true, no branch
  bne handleBNE  ; Zero flag will be false, branch
  nop            ; Padding in memory so the offset isn't zero

handleBNE:
  ldx #$42      ; Load something to prove execution is here
  bne handleBEQ ; Jump backwards to test negative offset