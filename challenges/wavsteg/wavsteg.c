#include <stdio.h>
#include <stdlib.h>
#include "wavsteg.h"

void print_usage(char *filename);

void print_header(wav_header *header) {
  printf("Channels: %d\n"\
      "Sample Rate: %d\n"\
      "Bitrate %d\n",
      header->num_channels, header->sample_rate, header->bits_per_sample);
}

int main(int argc, char *argv[]) {
  wav_header header;
  FILE *infp, *datafp, *newfp;
  int wav_data, data, encoded = 0;
  int i = 16;

  if (argc != 4) {
    print_usage(argv[0]);
    exit(1);
  }

  if ((infp = fopen(argv[1], "r")) == NULL) {
    printf("Unable to open file: %s.\n", argv[1]);
    exit(1);
  }

  if ((datafp = fopen(argv[2], "r")) == NULL) {
    printf("Unable to open file: %s.\n", argv[2]);
    exit(1);
  }

  if ((newfp = fopen(argv[3], "w")) == NULL) {
    printf("Unable to open file: %s.\n", argv[3]);
    exit(1);
  }

  fread(&header, sizeof(wav_header), 1, infp);
  print_header(&header);

  fwrite(&header, sizeof(wav_header), 1, newfp);

  while(!feof(infp)) {
    // Reset wave data in case file doesn't have 4 bytes remaining to read
    wav_data = 0;
    fread(&wav_data, sizeof(int), 1, infp);

    if (!feof(datafp) || (feof(datafp) && (i > 0))) {
      if (i > 15) {
        // Reset data in case file doesn't have 4 bytes remaining to read
        data = 0;
        fread(&data, sizeof(int), 1, datafp);
        i = 0;
      }
      /* Basic algorithm: we need to encode the LSB of each channel with
       * either a 0 or a 1, depending on which value is present in the 2 bits
       * of data.
       *
       * The problem is that bitwise operations are fine for flipping bits,
       * but not assigning them. So what we need to do, is take the 32 bit
       * wave frame, and separate out the high 16 bits (left channel) and low
       * 16 bits (right channel) and encode each LSB according to what is in
       * data.
       *
       * Next, determine if the sample is an even or odd integer. Even
       * integers will return 0 on int % 2 and odd will be 1. We can do a noop
       * when the LSB and the encoded data bit match. When they don't match,
       * they're odd, and we're encoding a 0, we simply subtract 1. When
       * they're even, and we're encoding a 1, we add 1.
       */

      /* Extract 2 bits from data, and separate into the "left" and "right"
       * bits for encoding.
       */
      int left_encode = 0x00000002 & data;
      left_encode >>= 1;
      int right_encode = 0x0000001 & data;

      /* Separate the channels. Despite 16bit samples being 2's-complement
       * signed integers this needs to be unsigned else the data comes out
       * garbled. I'm not sure what the actual cause is but I assume it may be
       * an integer overflow or an issue with right half not having the MSB
       * set to denote that it is negative.
       */
      unsigned int left = 0, right = 0;
      left = wav_data & 0xffff0000;
      left >>= 16;
      right = wav_data & 0x0000ffff;

      /* If we have an even number for the wave data and we're encoding a 1,
       * then simply add 1. Else if we have an odd number and we're encoding a
       * 0, subtract 1.
       */
      if ((left % 2 == 0) && (left_encode == 1)) {
        left++;
      } else if ((left % 2 == 1) && (left_encode == 0)) {
        left--;
      }

      if ((right % 2 == 0) && (right_encode == 1)) {
        right++;
      } else if ((right % 2 == 1) && (right_encode == 0)) {
        right--;
      }

      // Recombine the 2 channels.
      left <<= 16;
      encoded = (left | right);

      fwrite(&encoded, sizeof(int), 1, newfp);
      data >>= 2;
      i++;
    } else if (!feof(infp)) {
      fwrite(&wav_data, sizeof(int), 1, newfp);
    }
  }

  fclose(infp);
  fclose(datafp);
  fclose(newfp);

  return 0;
}

void print_usage(char *filename) {
  printf("Usage: %s <in file> <data> <new file>\n", filename);
}
