#!/bin/bash
#
# This scrip will pull together all of the various functions
# and will create the final artifact deliverable for the challenge.
# This is basically a tarball of a postgresql database.  
#

# Stop server
sudo service postgresql stop

# Clean up logs
sudo rm -rf ~postgres/data/pg_log/*
sudo rm -rf ~postgres/data/pg_xlog/*

# Build artifact
sudo tar --selinux -cJspf brometheus.tar.xz ~postgres

# Wipe database area clean.
sudo rm -rf ~postgres/*
