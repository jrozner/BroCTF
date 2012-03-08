#include <stdio.h>
#include <stdlib.h>
#include "wavsteg.h"

void print_usage(char *filename);

int main(int argc, char *argv[]) {
  wav_header header;
  FILE *infp, *outfp;
  int wav_data = 0, data = 0, i = 0, indata = 0, decoded = 0;

  if (argc != 3) {
    print_usage(argv[0]);
    exit(1);
  }

  if ((infp = fopen(argv[1], "r")) == NULL) {
    printf("Unable to open file: %s.\n", argv[1]);
    exit(1);
  }

  if ((outfp = fopen(argv[2], "w")) == NULL) {
    printf("Unable to open file: %s.\n", argv[1]);
    exit(1);
  }

  fread(&header, sizeof(wav_header), 1, infp);

  while (!feof(infp)) {
    /* Algorithm: Four bytes (left/right sample) are read in at a time and
     * the LSB is separated from each sample. This results in one of four
     * values: 0, 1, 65536, 65537. These are used to determine the values of
     * the LSBs which are combined into a 4 byte integer and then written out
     * to disk.
     */
    if (i > 15) {
      fwrite(&data, sizeof(int), 1, outfp);
      i = 0;
      data = 0;
    }

    /* Reset wav_data to 0 in case there isn't a full 4 bytes to read in then
     * read in a 32 bit wave frame.
     */
    wav_data = 0;
    fread(&wav_data, sizeof(int), 1, infp);
    indata = wav_data & 0x00010001;
    decoded = 0;
    switch(indata) {
      case 0:
        decoded = 0;
        break;
      case 1:
        decoded = 1;
        break;
      case 65536:
        decoded = 2;
        break;
      case 65537:
        decoded = 3;
        break;
    }

    decoded <<= (i * 2);
    data |= decoded;
    i++;
  }

  fclose(infp);
  fclose(outfp);

  return 0;
}

void print_usage(char *filename) {
  printf("Usage: %s <in file> <out file>\n", filename);
}
