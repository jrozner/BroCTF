#!/usr/bin/scapy
packets = rdpcap('dump.pcap')
outfile = open('dump.txt')
for dg in packets:
	outfile.write(dg.load[28:])
outfile.close()
