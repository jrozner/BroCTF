So what we did here was take a key and encode it into DTMF.

See, our keys are sha1 sum's.  so 40 hex characters.  But, wait, how do we do that?!

Well, pretty easy.  The extended DTMF tones are 0-9,A-D, and then * for E and # for F.

Take the key, sed the appropriate EF to *#, then use Audacity's "generate DTMF" with that string.

There are a couple of online decoders that will reverse this challenge.  There's also the multimon software, which will DTMF decode as well.

That aside, it's up to you to write your own.  It's all clean and FLAC, so there's no real noise filtering that neds to be done. Just regular frequency analysis.  Generous gaps between generously long tones.  Basic DSP code should work with this.

-- Nick
