; Verifies BMI and BPL
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
  bmi handleBMI  ; Negative flag will be false, no branch
  bmi handleBMI  ; Negative flag will be true, branch
  nop            ; Padding in memory so the offset isn't zero

handleBMI:
  lda #$42       ; Load something to prove execution is here
  bpl handleBPL  ; Negative flag will be true, no branch
  bpl handleBPL  ; Negative flag will be false, branch
  nop            ; Padding in memory so the offset isn't zero

handleBPL:
  ldx #$42      ; Load something to prove execution is here
  bpl handleBMI ; Jump backwards to test negative offset