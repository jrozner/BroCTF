// ICMP pcap tunnel of doom capture challenge

1) look at this gif for at least 30 seconds.


ok, now here's how we did this.. 

// Generating the dump

1) Set up a pingtunnel between two hosts

client...
IP: 10.100.0.42
command: ptunnel -p 10.100.0.69 -lp 1234 -da 10.100.0.69 -dp 5678 -v 4

server...
IP: 10.100.0.69
command: ptunnel -c en0 -v 4

2) Start up wireshark or tcpdump on the local interface between the two hosts, ideally with just a ethernet cable.  Filter for only ICMP, if you want to be nice or think you might have something sensitive running.  Otherwise, don't filter.

3) On the client, run the following script: send-challenge.sh

4) stop capture after send.

5) ?

6) Profit.

// Reversing the dump

1) Load the pcap file into wireshark.
2) create a filter, icmp.type == 8
 - this will only show ping requests, which hold all thee datas
3) re-order by packet sequence number
4) export only those displayed packets as a new pcap file
5) Run dumppcap.py to write out data to disk
6) find the part in the text output where the line width changes... 
7) Capture all of that bit of text.
8) Paste into a new file, called key.txt
9) recover using xxd as follows: xxd -ps -r key.txt key.jpg
10) view the jpeg for glorious keys.
