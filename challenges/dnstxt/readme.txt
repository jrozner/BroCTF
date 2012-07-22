// Zone Transfer

This is another small 100 pt challenge.   The DNS for the game goes something like this:

broc.tf master: 10.2.0.12, tcp/53 udp/53

The AXFR query isn't restricted.  So if they pull the entire zone, they'll find a hidden TXT record with the key below...

key: f17f148805505310e276e0d249825d2dc1e280fc

basically, to do an AXFR, use dig as follows:

dig @10.2.0.12 broc.tf AXFR

Inspect the records you get.  There will be a very obvious CNAME record with a rot13 version of the key. lol.

Setting up bind9 and a zone file is beyond this readme, but if you look at the git/infra/files-* configs, they'll give you the basics..

also, bro-tip: in Redhat land, first, install bind, get it configured and working the way you want.  THEN install bind-chroot, and it will migrate things for you and things will JustWork(tm) with a simple service named restart.  You may have to manually kill off the old named process first, as it will still have the old configs, etc.
