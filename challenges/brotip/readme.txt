// How to build this challenge.

1) run create-tips-db4.sh to build the DB4 file containing the tips. 
 - runs the brotips-scrape.php script to build the CSV file
 - runs the make-tip-db.sh script to build the DB4 from the CSV
 - runs insert-key.sh to add in the key to the DB4 file
 - tests for insertion correctness
 - compresses db4 file as artifact for next step
2) run build-postgres.sh to create the brometheus PostGreSQL database.
 - inserts base64'd JPEG's of everything including the DB4 compressed archive as hstore() records
3) run build-artifact.sh to create the final deliverable.
 - wipes postgres logs
 - compresses DB into deliverable
 - wipes PG database completely so you can start anew. (DO NOT RUN ON ANYTHING YOU HAVE PRODUCTION DATA ON PLEASE!)

// How to decode this challenge.

1) install postgresql and postgresql-contrib (needed for hstore)
2) unpack archive into ~postgres
3) service postgresql start
4) psql -c "select tip from brometheus where tipid=46" -d brometheus > somefile.txt
5) base64 -d somefile.txt > brotips.db4.xz
6) xz brotips.db4.xz
7) db_dump brotips.db4 | grep key 
