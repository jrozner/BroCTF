#!/bin/bash
#
# firewall and ACL script.  This one uses default deny.  It's more complex because of the sheer number
# of allow's we need, but theoretically, is more secure.  We'll see. 

if [ "" == "$1" ]; then
	CHROOT=""
else
	CHROOT="$1"
	if [ ! -d "$CHROOT" ]; then
		mkdir -p $CHROOT
		if [ 0 != "$?" ]; then
			echo "Exit bitch, fix your chroot."
			exit 1
		fi
	fi
fi

# Flush out default rulesets
iptables -F
iptables -t nat -F

# Set default policies to deny
iptables -P INPUT DROP
iptables -P FORWARD DROP

# Allow localhost
iptables -A INPUT -i lo -j ACCEPT

# Start by dropping everything new coming into the DJ's
# and the admin interface, but accepting new outbound
# and related packets coming back.
iptables -A INPUT -m state --state RELATED,ESTABLISHED -i bond0.69 -j ACCEPT
iptables -A INPUT -m state --state NEW -i bond0.100 -s 10.200.0.0/24 -j ACCEPT
iptables -A INPUT -m state --state RELATED,ESTABLISHED -i bond0.100 -j ACCEPT
iptables -A INPUT -m state --state NEW -i bond0.100 -j DROP
iptables -A INPUT -m state --state NEW -i bond0.1 -s 10.100.0.0/24 -j ACCEPT
iptables -A INPUT -m state --state RELATED,ESTABLISHED -i bond0.1 -j ACCEPT
iptables -A INPUT -m state --state NEW -i bond0.1 -j DROP

# Allow admin/DJ's onto the wider internet
iptables -t nat -A POSTROUTING -o bond0.69 -j MASQUERADE
iptables -A FORWARD -i bond0.69 -o bond0.100 -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i bond0.100 -o bond0.69 -s 10.200.0.0/24 -j ACCEPT
iptables -A FORWARD -i bond0.69 -o bond0.1 -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i bond0.1 -o bond0.69 -s 10.100.0.0/24 -j ACCEPT

# Allow game network to connect to player network, giggety.
iptables -A INPUT -i bond0.2 -s 10.2.0.0/24 -j ACCEPT
iptables -A FORWARD -i bond0.2 -d 10.1.0.0/24 -j ACCEPT

# Allow players to connect to game.
iptables -A INPUT -s 10.1.0.0/24 -d 10.2.0.0/24 -j ACCEPT
iptables -A FORWARD -s 10.1.0.0/24 -d 10.2.0.0/24 -j ACCEPT

# Allow admin's everywhere else, but the DJ's.
iptables -A INPUT -i bond0.1 -s 10.100.0.0/24 -j ACCEPT
iptables -A FORWARD -i bond0.1 -s 10.100.0.0/24 -j ACCEPT
iptables -A FORWARD -m state --state RELATED,ESTABLISHED -i bond0.2 -s 10.2.0.0/24 -j ACCEPT
iptables -A FORWARD -m state --state RELATED,ESTABLISHED -s 10.1.0.0/24 -j ACCEPT

# Allow the player VLAN's to hit the challenge network, and pretty much
# nothing else.  ntpd, httpd, scoreboard, etc., will all reside in the
# challenge network.
for tag in {1101..1148}; do
	# The player's IP's will follow this formula:
	# IP=(((TAG-1101)*4)+2)
	BASE=$(($tag - 1101))
	BASE=$(($BASE * 4))
	IP="10.1.0.$(($BASE+2))"
	# Allow them to hit the router
	iptables -A INPUT -i bond0.${tag} -s "$IP" -j ACCEPT
done

iptables-save > $CHROOT/etc/sysconfig/iptables
