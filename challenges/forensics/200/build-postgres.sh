#!/bin/bash
#
# Make up a super-awesome PostGres DB.
#

# make sure we even have hstore support
rpm -q postgresql-contrib 2>&1 >> /dev/null

if [ "$?" != "0" ]; then
	echo "HStore not available.  Install postgresql-contrib."
	exit 1
fi

# Is the PG database alive? Try and start if not,
# fail if we can't. :(
if [ `pgrep postgres | wc -l` < 3 ]; then
	# Start'er up.
	createdb
	service postgresql start
fi
if [ `pgrep postgres | wc -l` < 3 ]; then
	echo "Unable to start postgres, wtf did you do?"
	exit 3
fi

DB="brometheus"

# Drop original table
dropdb $DB

# Recreate original 
createdb $DB

# Apply hstore modules
psql -d $DB -f /usr/share/pgsql/extension/hstore--1.0.sql
psql -d $DB -c "CREATE EXTENSION hstore;"

# Make a DB 
psql -c "CREATE TABLE brotips ( tipID SERIAL PRIMARY KEY NOT NULL, tip hstore );"

# User first
psql -c "SET autocommit TO 'on'; CREATE USER broctf WITH  ENCRYPTED PASSWORD 'loldongs' NOCREATEDB NOCREATEUSER;" $DB

# Set user perms
psql -c "GRANT SELECT ON brotips TO broctf" $DB

# make the data file nao
BRODATA="bromages-data.txt"
rm -f $BRODATA
echo "INSERT INTO brotips VALUES" >> $BRODATA
I=0
cd bromages
for file in *.*; do
	B64=`base64 -w0 "${file}"`
	echo "(${I}, hstore('${file}', '$B64'))," >> ../$BRODATA
	I=$(($I+1))
done
cd ..

# Drop the key
KEY=`base64 -w0 brotips.db.xz`
echo "(${I}, hstore('coolstorybro.jpg', '$KEY'));" >> $BRODATA

# Sanity check
if [ `wc -l $BRODATA` < 20 ]; then
	echo "Something went wrong making the data file.  bailing out now."
	exit 4
fi

cat $BRODATA | psql -d $DB

if [ "$?" != "0" ]; then
	echo "Something went wrong on insert."
	exit 5
fi

echo "All done!"

exit 0
