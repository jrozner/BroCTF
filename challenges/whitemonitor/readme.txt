// White Monitor Challenge

// How we did it: Physical Build
Follow the instructions in the included PDF file that we ganked from instructibles.com.  

The TL;DR version is that we removed the polarizer and glare/reflection filters from the LCD itself.  

This way, you have to cut pieces of the polarizer into glasses shapes to be able to view it.

The monitor itself is just displaying a full-screen QR code as a desktop background or screensaver or something, and if they put the polarizer in front of their camera, they can scan the QR code.

// How we did it: software side
echo -n "<key>" | qrencode -l H -d 600 -s 18 -o keyfile.png

Open in Gimp, place on white background the same size as the monitor display resolution.  Choose as image-based screensaver.  Lock screen.

-- Nick
