import albumsData from "./albums.json";

export interface Album {
  id: string;
  title: string;
  description: string;
  cover: string;
  date: string;
  photos: { src: string; caption: string }[];
}

export const albums: Album[] = albumsData.albums;
