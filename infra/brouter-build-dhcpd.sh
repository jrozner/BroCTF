#!/bin/bash
# 
# Script to build the DHCP stanzas for the game.

if [ "$1" != "" ]; then
        OUTFILE="$1"
	SYSC="$i-sysconfig"
else
        OUTFILE="/etc/dhcp/dhcpd.conf"
	SYSC="/etc/sysconfig/dhcpd"
fi

if [ -x "${OUTFILE}" ]; then
        rm -f ${OUTFILE}
	rm -f ${SYSC}
fi

# Global header stuff for dhcpd.conf
cat <<EOF > $OUTFILE
ddns-update-style none;
ignore client-updates;
authoritative;

EOF

# 3MC's and 1 DJ network
cat <<EOF >> $OUTFILE
subnet 10.200.0.0 netmask 255.255.255.0 {
	# 3 days lease
	default-lease-time 259200;
	max-lease-time 259200;
	option subnet-mask 255.255.255.0;
	option routers 10.200.0.1;
	option domain-name "broc.tf";
	option domain-name-servers 8.8.8.8, 4.2.2.2;
	range 10.200.0.10 10.200.0.250;
}

EOF

# Bro's bro's bro's!
cat <<EOF >> $OUTFILE
subnet 10.100.0.0 netmask 255.255.255.0 {
	default-lease-time 259200;
	max-lease-time 259200;
	option subnet-mask 255.255.255.0;
	option routers 10.100.0.1;
	option domain-name "broc.tf";
	option domain-name-servers 8.8.8.8, 4.2.2.2, 10.2.0.12;
	range 10.100.0.200 10.100.0.250;

	# Magic IP's for awesome bros
	host vector {
		hardware ethernet 00:21:cc:b6:55:5e;
		fixed-address	10.100.0.42;
	}
	host livinded {
		hardware ethernet 00:26:bb:4e:6c:fe;
		fixed-address	10.100.0.69;
	}
}

EOF

# Public player ip assignments
for i in {1101..1148}; do
	BASE=$(($i - 1101))
	BASE=$(($BASE * 4))
	NETWORK="10.1.0.$BASE"
	ROUTER="10.1.0.$(($BASE+1))"
	JUMP="10.1.0.$(($BASE+2))"
	SUBNET="255.255.255.252"
cat <<EOF >> $OUTFILE
subnet $NETWORK netmask $SUBNET {
	default-lease-time 259200;
	max-lease-time 259200;
	option subnet-mask $SUBNET;
	option routers $ROUTER;
	option domain-name "broc.tf";
	option domain-name-servers 10.2.0.12, 10.2.0.13;
	range $JUMP $JUMP; # CRISS CROSS!

}

EOF
done

# Build /etc/sysconfig/dhcp
echo "# Command line options here" > $SYSC
echo -n "DHCPDARGS=\"" >> $SYSC

for i in 1 100 {1101..1148}; do
	echo -n "bond0.${i} " >> $SYSC
done
echo -n "\"" >> $SYSC

restorecon -R /etc/sysconfig
restorecon -R /etc/dhcp
