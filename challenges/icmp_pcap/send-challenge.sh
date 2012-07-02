#!/bin/bash
#
# This will send the challenge data over the network, prepare to pcap.

LULZLOAD="prolapse.gif"
KEYLOAD="key.jpg"
OUTPUT="brolapse"

# Step one, broload the first image..
xxd -p "$LULZLOAD" >>  $OUTPUT

# Step 2, broload the second keymaterial with a 40 col wrap so if they
# ngrep, they get a key in a sea of keys.
xxd -p -c 40 "$KEYLOAD" >> $OUTPUT

# Step 3, repeat horrific gif.
xxd -p "$LULZLOAD" >>  $OUTPUT

echo "broloading complete.  Cat into ping tunnel at your convenience."
