// Creado con https://app.quicktype.io/

export type FormatMetadata = {
    streams: Stream[];
    format:  Format;
}

export type Format = {
    filename:         string;
    nb_streams:       number;
    nb_programs:      number;
    nb_stream_groups: number;
    format_name:      string;
    format_long_name: string;
    start_time:       string;
    duration:         string;
    size:             string;
    bit_rate:         string;
    probe_score:      number;
    tags:             FormatTags;
}

export type FormatTags = {
    major_brand:       string;
    minor_version:     string;
    compatible_brands: string;
    encoder:           string;
}

export type Stream = {
    index:                 number;
    codec_name:            string;
    codec_long_name:       string;
    profile:               string;
    codec_type:            string;
    codec_tag_string:      string;
    codec_tag:             string;
    width?:                number;
    height?:               number;
    coded_width?:          number;
    coded_height?:         number;
    has_b_frames?:         number;
    sample_aspect_ratio?:  string;
    display_aspect_ratio?: string;
    pix_fmt?:              string;
    level?:                number;
    color_range?:          string;
    color_space?:          string;
    color_transfer?:       string;
    color_primaries?:      string;
    refs?:                 number;
    id:                    string;
    r_frame_rate:          string;
    avg_frame_rate:        string;
    time_base:             string;
    start_pts:             number;
    start_time:            string;
    duration_ts:           number;
    duration:              string;
    bit_rate:              string;
    nb_frames:             string;
    disposition:           { [key: string]: number };
    tags:                  StreamTags;
    sample_fmt?:           string;
    sample_rate?:          string;
    channels?:             number;
    channel_layout?:       string;
    bits_per_sample?:      number;
    initial_padding?:      number;
    extradata_size?:       number;
}

export type StreamTags = {
    language:     string;
    handler_name: string;
    vendor_id:    string;
}

export type ImageData =  {
  streams: ImageStream[],
  format: ImageFormat
}

export type ImageStream = {
  index: number,
  codec_name: string
  codec_long_name: string
  codec_type: string
  codec_tag_string: string
  codec_tag: string
  width: number
  height: number
  coded_width: number
  coded_height: number
  has_b_frames: number
  pix_fmt: string
  level: number
  color_range: string
  color_space: string
  refs: number
  r_frame_rate: string
  avg_frame_rate: string
  time_base: string
  disposition: Disposition[]
}

export type ImageFormat = {
  filename: string
  nb_streams: number
  nb_programs: number
  nb_stream_groups: number
  format_name: string
  format_long_name: string
  size: string
  probe_score: number
}

export type Disposition = {
  default: number
  dub: number
  original: number
  comment: number
  lyrics: number
  karaoke: number
  forced: number
  hearing_impaired: number
  visual_impaired: number
  clean_effects: number
  attached_pic: number
  timed_thumbnails: number
  non_diegetic: number
  captions: number
  descriptions: number
  metadata: number
  dependent: number
  still_image: number
  multilayer: number
}
