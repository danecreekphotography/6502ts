; Verifies PHA PLA PHP PLP
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    ldx #$FF    ; Initialize the stack pointer
    txs
    
    pha     ; Accumulator will have 0x42 in it
    pla     ; Accumulator will get cleared before running this command
    php     ; Processor status will have 0xFF in it
    plp     ; Processor status will get cleared before running this