#!/bin/bash
#
# Script to auto-gen the network interfaces on the router.
# The router only handles the public VLAN's from the player
# jump boxes, the switches handle the private part, so we
# don't have to 100+ VLAN's, just 52. Nice.

# Start with the easy part, which is the VLAN interfaces.
#
# Note that the defcon drop is unknown at this point, likely
# DHCP like last year, but we're leaving it out of this part.
if [ "" -eq "$1" ]; then
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
BASEPATH="$CHROOT/etc/sysconfig/network-scripts"
for tag in `seq 1101 1148` 1 2 100; do
	DEV="bond0.$tag"
	OUTPHILE="$BASEPATH/ifcfg-$DEV"
	if [ -f "$OUTPHILE" ]; then
		rm -f $OUTPHILE
	fi
	case "$tag" in
		1)
			IP="10.100.0.1"
			NM="255.255.255.0"
			BC="10.100.0.255"
                        NW="10.100.0.0"
			;;
		2)
			IP="10.$tag.0.1"
			NM="255.255.255.0"
			BC="10.$tag.0.255"
                        NW="10.$tag.0.0"
			;;
		100)
			IP="10.200.0.1"
			NM="255.255.255.0"
			BC="10.200.0.255"
                        NW="10.200.0.0"
			;;

		*)
			BASE=$(($tag - 1101))
			BASE=$(($BASE * 4))
			IP="10.1.0.$(($BASE+1))"
			NM="255.255.255.252"
			BC="10.1.0.$(($BASE+3))"
			NW="10.1.0.$(($BASE))"
			;;
		
	esac		
			
	echo "DEVICE=\"$DEV\"" >> $OUTPHILE
	echo "BOOTPROTO=\"static\"" >> $OUTPHILE
	echo "NM_MANAGED=\"no\"" >> $OUTPHILE
	echo "VLAN=\"yes\"" >> $OUTPHILE
	echo "ONBOOT=\"yes\"" >> $OUTPHILE
	echo "IPADDR=$IP" >> $OUTPHILE
	echo "NETMASK=$NM" >> $OUTPHILE
	echo "NETWORK=$NW" >> $OUTPHILE
	echo "BROADCAST=$BC" >> $OUTPHILE
done

# Now for the Defcon VLAN
tag="69"
DEV="bond0.$tag"
OUTPHILE="$BASEPATH/ifcfg-$DEV"
if [ -f "$OUTPHILE" ]; then
	rm -f $OUTPHILE
fi
cat << EOF > $OUTPHILE
DEVICE="$DEV"
BOOTPROTO="dhcp"
VLAN="yes"
ONBOOT="yes"
NM_MANAGED="no"
EOF

# DERP, add the bonded interface next.
DEV="bond0"
OUTPHILE="$BASEPATH/ifcfg-$DEV"
if [ -f "$OUTPHILE" ]; then
	rm -f $OUTPHILE
fi
cat << EOF > $OUTPHILE
DEVICE="$DEV"
BOOTPROTO="none"
ONBOOT="yes"
NM_MANAGED="no"
BONDING_OPTS="miimon=100 mode=4 lacp_rate=fast"
EOF

# Build out eth0
DEV="p33p1"
OUTPHILE="$BASEPATH/ifcfg-$DEV"
if [ -f "$OUTPHILE" ]; then
	rm -f $OUTPHILE
fi
cat << EOF > $OUTPHILE
DEVICE="p33p1"
HWADDR="00:30:18:A6:95:F8"
BOOTPROTO="none"
ONBOOT="yes"
NM_CONTROLLED="no"
SLAVE="yes"
MASTER="bond0"
EOF

# Build out eth0
DEV="p34p1"
OUTPHILE="$BASEPATH/ifcfg-$DEV"
if [ -f "$OUTPHILE" ]; then
	rm -f $OUTPHILE
fi
cat << EOF > $OUTPHILE
DEVICE="p34p1"
HWADDR="00:30:18:A6:95:F9"
BOOTPROTO="static"
ONBOOT="yes"
NM_CONTROLLED="no"
SLAVE="yes"
MASTER="bond0"
EOF

# Set some options to make your routing table less ugly
OUTPHILE="/etc/sysconfig/network"
if [ -f "$OUTPHILE" ]; then
	rm -f $OUTPHILE
fi
cat << EOF >> /etc/sysconfig/network
NETWORKING=yes
HOSTNAME=brouter.broc.tf
IPV6_INIT=no
NOZERONF=yes
GATEWAYDEV="bond0.69"
EOF

# Turn on IP forwarding
RCL="$CHROOT/etc/rc.local" 
grep -q "ip_forward" "$RCL" 2>&1 > /dev/null
if [ "0" != "$?" ]; then
	echo "echo 1 > /proc/sys/net/ipv4/ip_forward" >> $RCL
fi
