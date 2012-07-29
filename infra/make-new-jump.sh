#!/bin/bash
#
# Make a new jump box for a team!
#read -p "Team Name: " TEAM
TEAM="$1"
virsh destroy $TEAM
virsh undefine $TEAM
virsh vol-delete --pool jump_vms $TEAM
virsh vol-create-as jump_vms $TEAM 2G
virt-clone -o jump_free_gold --name $TEAM --file /dev/mapper/vg_burden-$TEAM
echo "SWITCH BRIDGES BITCH!"
virsh edit $TEAM
virsh start $TEAM
