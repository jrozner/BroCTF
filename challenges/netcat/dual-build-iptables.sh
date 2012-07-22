#!/bin/sh
#
# Deny all outbound that isn't related, or started on port 53.

iptables=$(which iptables)

$iptables -F

$iptables -P INPUT DROP
$iptables -P FORWARD DROP
$iptables -P OUTPUT DROP

$iptables -A INPUT -p tcp -m state --state NEW,RELATED,ESTABLISHED --dport 22 -j ACCEPT
$iptables -A INPUT -p tcp -m state --state NEW,RELATED,ESTABLISHED --dport 3863 -j ACCEPT
$iptables -A INPUT -p udp -m state --state NEW,RELATED,ESTABLISHED --dport 53 -j ACCEPT
$iptables -A INPUT -p icmp -j ACCEPT

$iptables -A OUTPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
$iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
$iptables -A OUTPUT -p icmp -j ACCEPT
