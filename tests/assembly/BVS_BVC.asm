; Verifies BVS and BVC
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
  bvs handleBVS  ; Overflow flag will be false, no branch
  bvs handleBVS  ; Overflow flag will be true, branch
  nop            ; Padding in memory so the offset isn't zero

handleBVS:
  lda #$42       ; Load something to prove execution is here
  bvc handleBVC  ; Overflow flag will be true, no branch
  bvc handleBVC  ; Overflow flag will be false, branch
  nop            ; Padding in memory so the offset isn't zero

handleBVC:
  ldx #$42      ; Load something to prove execution is here
  bvc handleBVS ; Jump backwards to test negative offset