Howto::Creation of artifacts

1) Create 3 200MB images and attach them to loopback devices

for i in `seq 1 3`; do
	dd if=/dev/zero of=stripe${i} bs=1M count=200
	losetup -f --show stripe${i}
done

2) Mark each one as having a linux sw raid5.

for i in `seq 0 2`; do
	parted -s /dev/loop${i} mklabel gpt
	parted -s /dev/loop${i} mkpart primary 0 200
	parted -s /dev/loop${i} set 1 raid
done

3) Build the RAID array

mdadm --create /dev/md100 --level 5 --raid-devices 3 /dev/loop0 /dev/loop1 /dev/loop2

4) Install the btrfs filesystem and mount it.

mkfs.btrfs -L brometheus /dev/md100 
mount /dev/md100 /mnt/tmp

5) Create RedHerringFS

for i in bin boot dev mnt etc lib home root proc sys sbin tmp usr var; do
	mkdir /mnt/tmp/${i}
done
cp -a /etc/skel/.[a-z]* /mnt/tmp/root/

RHFS="/mnt/tmp/dev/loop0"
dd if=/dev/zero of=${RHFS} bs=1M count=20
parted -s ${RHFS} mklabel gpt
parted -s ${RHFS} mkpart primary 0 20
mkfs.ext4 -F -m0 -L brofound ${RHFS}
mount ${RHFS} /mnt/tmp/mnt
cp -a ~vector/work/octf/2012/forensics/100/for100-rhfs-images/* /mnt/tmp/mnt/
umount /mnt/tmp/mnt

6) Create challenge files

KEY1=59413f48a4a8586d50ba7
KEY2=6966387d40198fd67a8

vim flag.txt
insert mode
paste KEY1
kill -9 $VIMPROC
vim problem.txt
insert mode
paste KEY2

7) Copy files into root's homedir

cp ~vector/work/octf/2012/forensics/100/{.flag.txt.swp,problem.txt} /mnt/tmp/root/

8) Unmount filesystem, stop raid, and detatch loops

umount /mnt/tmp/
sync && sync
mdadm --stop /dev/md100
for i in `seq 0 2`; do
	losetup -d /dev/loop$i
done

9) Obfuscate a little
mv stripe1 lol
mv stripe2 dongs
rm stripe3 

10) Tar up two of the three stripes for distribution

yum -y install lzma (only once)
tar -cspf forensics100.tar.lzma --lzma lol dongs 

