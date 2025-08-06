export interface TodoItem {
  id: string;
  todoText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  fullname: string;
  code: string;
  nickname: string;
  imageUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}