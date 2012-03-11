#!/bin/bash
# 
# Simple script to generate 25 random hashes.  Each hash
# will be a key somehow hidden in the challenges.
#
for i in `seq 1 25`; do
	dd if=/dev/urandom bs=1024 count=1 2>/dev/null | sha1sum  | sed -e "s/  -$//g" >> keys.txt
done
