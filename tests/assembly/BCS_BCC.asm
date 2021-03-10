; Verifies BCS and BCC
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
  bcs handleBCS  ; Carry flag will be false, no branch
  bcs handleBCS  ; Carry flag will be true, branch
  nop            ; Padding in memory so the offset isn't zero

handleBCS:
  lda #$42       ; Load something to prove execution is here
  bcc handleBNE  ; Carry flag will be true, no branch
  bcc handleBNE  ; Carry flag will be false, branch
  nop            ; Padding in memory so the offset isn't zero

handleBNE:
  ldx #$42      ; Load something to prove execution is here
  bne handleBCS ; Jump backwards to test negative offset