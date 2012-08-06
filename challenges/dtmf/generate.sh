#!/bin/bash
# 
# Script to generate the HEX stream used to make the artifact.
KEY="4b1e1f9654266e821fed5b7468aef468cb83c88c"
echo "$KEY" | zip | xxd -p  | tr -d "\n" | sed -e "s/e/*/g;s/f/#/g" | tr a-d A-D | xsel
echo "Now, paste your output into Audacity's DTMF generator."
echo "Give it about half a second for DTMF length."
