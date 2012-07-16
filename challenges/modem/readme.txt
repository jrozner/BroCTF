How we made this challenge work

// Hardware required

* Two external modems
  - one of which should be a "voice modem". (eg: have a mic and speaker 1/8" jacks)
  - Said modem will be modem 1.  The other will be modem 2.

* Two serial ports (USB->Serial or 16550 UART, doesn't matter)

* Good quality RJ11 cat3 cable

* 1/8" male to male stereo cable

* One PC with above 2 serial ports and a sound card with a 1/8" line-in jack

// Hardware Setup

1) Connect both modems via serial to the host computer
2) Connect the speaker jack on modem 1 (the "voice modem") to the host computer's line in
3) Connect the "line" RJ11 jacks on the modem with said CAT3 cable
4) Connect both modems to power

// Software setup

1) open two terminals
2) open a minicom instance in setup mode (minicom -s) in each terminal
3) Set the first instance to use the serial port connected to modem 1
4) Set the secod instance to use the serial port connected to modem 2.
5) Set both terminals to 300 N81
6) Open your mixer, and be sure the input levels are set to medium for your line inputs
7) Start recording
8) Send the following commands to both modems:
 at x0
 at m2
 at l1

9) on modem 1 (the voice modem), type:
 at d

10) on modem 2, type:
 at a

11) Once you receive CONNECTED on one terminal, and the CD lights light up on both ends, you can simply paste the key into one terminal (Doesn't matter which).

12) Once you've pasted the key a few dozen times, then you can hang up (ctlr-a h) both modems.

13) stop recording, export as FLAC.

// Decoding the challenge

300 baud still uses FSK (frequency shift keying).  Open the resulting file in audacity and switch the track to spectral view.  See the two lines?  The lower line that is *fixed* in frequency is the carrier wave.  The line above it that shifts up and down is the data that's coming through it.  

There's a tool called multimon that supposedly can handle the decoding of up to 1200bps, but we couldn't get it to work.

What I'd done in the past was connect two modems, plug in my handset, then play the tones back through the microphone port.  It was enough to decode Information Society's 300N81 in 1993. :)

-- Nick
