#!/bin/bash
#
# Script to write out the config files for the network interfaces.
# Specifically, it will handle creating the 2 local eth0/1 bonds,
# as well as the bond0 and then bring up the VLAN's and bridges.

# path to sysconfig
if [ "" == "$1" ]; then
	SYSC="/etc/sysconfig/network-scripts"
else
	SYSC="$1"
fi

# Turn off zero-config and IPv6
cat <<EOF > /etc/sysconfig/network
NETWORKING=yes
HOSTNAME=beast.broc.tf
NOZEROCONF=yes
IPV6_INIT=no
EOF

# take care of kernel module for bonding
echo -e "alias bond0 bonding\nalias bond1 bonding" > /etc/modprobe.d/bonding.conf

# Prepare the two onboard cards to become bonding slaves.
# Grab MAC's from ifconfig, not network-scripts/ifcfg-*
for i in 1 2; do
	NETFILE="$SYSC/ifcfg-eth${i}"
	MAC=`ifconfig -a | grep eth${i} | awk '{print $5}'`
	cat <<EOF > $NETFILE 
DEVICE="eth${i}"
HWADDR="$MAC"
ONBOOT="yes"
NM_CONTROLLED="no"
BOOTPROTO="none"
SLAVE="yes"
MASTER="bond0"
EOF
done

# Write out the bond config
BONDIFACE=ifcfg-bond0
cat <<EOF > ${SYSC}/${BONDIFACE}
DEVICE=bond0
BOOTPROTO=none
ONBOOT=yes
NM_MANAGED=no
BONDING_OPTS="miimon=100 mode=4 lacp_rate=1"
EOF

# For admin interface (no bridge)
cat <<EOF > ${SYSC}/${BONDIFACE}.1
# VLAN interface on top of LACP bond
DEVICE=bond0.1
BOOTPROTO=none
ONBOOT=yes
NM_MANAGED=no
VLAN=yes
IPADDR=10.100.0.10
NETMASK=255.255.255.0
GATEWAY=10.100.0.1
EOF

# Now, the VLAN's that are going to be bridged.
VLANID=2
cat <<EOF > ${SYSC}/${BONDIFACE}.${VLANID}
# VLAN interface on top of LACP bond
DEVICE=bond0.$VLANID
BOOTPROTO=none
ONBOOT=yes
NM_MANAGED=no
VLAN=yes
BRIDGE=br${VLANID}
EOF

# Lastly, the actual bridge interfaces themselves.  These
# are again, just layer 2 interfaces.  the VM's themselves
# will do all the layer 3 stuff.
VLANID=2
cat <<EOF > ${SYSC}/"ifcfg-br${VLANID}"
# Bridge to the VLAN interface for the VM's
ONBOOT=yes
NM_MANAGED=no
TYPE=Bridge
DELAY=0
DEVICE=br${VLANID}
EOF
