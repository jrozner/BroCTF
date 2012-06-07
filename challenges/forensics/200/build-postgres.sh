#!/bin/bash
#
# Make up a super-awesome PostGres DB.
#

PGADMIN="postgres"

# See if the admin user is even set up
id -u $PGADMIN 2>&1 > /dev/null
if [ "$?" != "0" ]; then
	echo "wtf, no postgres super-user. cannot continue."
	exit 6
fi

# make sure we even have hstore support
rpm -q postgresql-contrib 2>&1 >> /dev/null
if [ "$?" != "0" ]; then
	echo "HStore not available.  Install postgresql-contrib."
	exit 1
fi

# Is the PG database alive? Try and start if not,
# fail if we can't. :(
if [ `pgrep postgres | wc -l` -lt 3 ]; then
	# Start'er up.
	sudo su -c "createdb"  - $PGADMIN
	sudo service postgresql start
fi
if [ `pgrep postgres | wc -l` -lt 3 ]; then
	echo "Unable to start postgres, wtf did you do?"
	exit 3
fi

# Drop original table
echo "Dropping $DB"
DB="brometheus"
sudo su -c "dropdb $DB" - $PGADMIN

# Set us up the admin user
echo "Dropping old role."
sudo su -c "dropuser vector;" - $PGADMIN
echo "Adding new role."
sudo su -c "createuser -d -l -s vector" - $PGADMIN

### by this point, your current user should have 
### PG superuser rights.

# Recreate original
echo "Creating database"
createdb $DB

# Apply hstore modules
psql -d $DB -f /usr/share/pgsql/extension/hstore--1.0.sql
psql -d $DB -c "CREATE EXTENSION hstore;"

# Make a DB 
psql -d $DB -c "CREATE TABLE brotips ( tipID SERIAL PRIMARY KEY NOT NULL, tip hstore );"

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
if [ `wc -l "$BRODATA"` -lt 20 ]; then
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
