typedef struct __wav_header {
  int chunk_id;
  int chunk_size;
  int format;
  int sub_chunk_1_id;
  int sub_chunk_1_size;
  short audio_format;
  short num_channels;
  int sample_rate;
  int byte_rate;
  short block_align;
  short bits_per_sample;
  int sub_chunk_2_id;
  int sub_chunk_2_size;
} wav_header;

void print_header(wav_header *header);
