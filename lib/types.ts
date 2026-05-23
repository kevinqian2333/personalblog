export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  cover: string;
  tags: string[];
  category: string;
  date: string;
  formattedDate: string;
  year?: string;
  content?: string;
}

export interface SongMeta {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  lrcUrl: string;
  lyrics: { time: number; text: string }[];
}

export interface FriendMeta {
  name: string;
  url: string;
  avatar: string;
  description: string;
}

export interface ProjectMeta {
  id: string;
  title: string;
  description: string;
  cover: string;
  techs: string[];
  github: string;
  demo: string;
  category: string;
}

export interface AlbumMeta {
  id: string;
  title: string;
  description: string;
  cover: string;
  date: string;
  photos: { src: string; caption: string }[];
}
