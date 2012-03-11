#!/bin/bash
#
# This script will build the RAID image we store the challenge on

WORKINGDIR="/home/vector/work/octf/2012/git/challenges/forensics/100"
RAIDDEV="/dev/md100"
RAIDMNT="/mnt/tmp"
RHFSMNT="$RAIDMNT/mnt"
RHFS="$RAIDMNT/dev/loop0"

if [ "0" != `id -u` ]; then
	echo "$0 must be run as root."
	exit 1
fi


cd $WORKINGDIR

if [ "0" != "$?" ]; then
	echo "Please create a directory to work with all of this stuff, set the"
	echo "WORKIGNDIR variable in this script, and then run it again dingus."
	exit 2
fi

# Create the initial devices
if [ -e "/dev/loop0" ]; then
	echo "/dev/loop0 (and possibly 1 and 2) already exists.  Please adjust"
	echo "the sequence numbers under the initial device creation accordingly,"
	echo "or otherwise detach those loopbacks."
	exit 3
fi

for i in `seq 0 2`; do
        dd if=/dev/zero of=stripe${i} bs=1M count=200
        losetup /dev/loop${i} stripe${i}
done

# Create RAID partitions for said devices
for i in `seq 0 2`; do
        parted -s /dev/loop${i} mklabel gpt
        parted -s /dev/loop${i} mkpart primary 0 200
        parted -s /dev/loop${i} set 1 raid
done

# Create the RAID device
if [ -e "$RAIDDEV" ]; then
	echo "$RAIDDEV exists.  Stop the array or otherwise alter RAIDDEV"
	echo "in the script."
	exit 4
fi

mdadm --create $RAIDDEV --force --level 5 --raid-devices 3 /dev/loop0 /dev/loop1 /dev/loop2

# Create outer filesystem
# (yum -y install btrfs-progs if you need it)
if [ ! -x `which mkfs.btrfs` ]; then
	echo "Install btrfs-progs package."
	exit 5
fi
mkfs.btrfs -L brometheus $RAIDDEV

# Mount and prepare for pwnage
if [ ! -d "$RAIDMNT" ]; then
	mkdir -p "$RAIDMNT"
fi

mount $RAIDDEV $RAIDMNT

# Create illusory filesystem
for i in bin boot dev mnt etc lib home root proc sys sbin tmp usr var; do
   mkdir $RAIDMNT/${i}
done

cp -a /etc/skel/.[a-z]* $RAIDMNT/root/

# Create 20MB RedHerring filesystem and fill with lulz
dd if=/dev/zero of=${RHFS} bs=1M count=20
parted -s ${RHFS} mklabel gpt
parted -s ${RHFS} mkpart primary 0 20
mkfs.ext4 -F -m0 -L brofound ${RHFS}
mount ${RHFS} $RHFSMNT
if [ ! -d "for100-rhfs-images" ]; then
	echo "zomg, lulzy images not found! abort!"
	exit 6
fi

cp -a for100-rhfs-images/* $RHFSMNT/
sync && sync
umount $RHFSMNT

# Copy in the challenge files lawl
cp .flag.txt.swp problem.txt $RAIDMNT/root/

# Unmount outer FS, sync, stop and detatch loops
sync && sync
umount $RAIDMNT
mdadm --stop $RAIDDEV
for i in `seq 0 2`; do
	losetup -d /dev/loop${i}
done

# now a little obfuscation..
mv stripe0 lol
mv stripe1 dongs
rm -f stripe2

# Compression should be the last step...
if [ ! -x `which lzma` ]; then
	echo "Might want to install the LZMA package."
fi
echo "Now, compress!!!"
exit 0
