; Verifies PHA PLA PHP PLP
.segment "VECTORS"

.word $eaea
.word init
.word $eaea

.code

init:
    ldx #$FF    ; Initialize the stack pointer
    txs
    
    pha     ; A will have $42 in it.
    pha     ; A will have $00 in it.
    pha     ; A will have %10010101 in it.
    pla     ; Accumulator will get cleared before running this command.
    pla
    pla
    php     ; Processor status will have 0xFF in it.
    plp     ; Processor status will get cleared before running this.