export interface TodoItem {
  id: string;
  todoText: string;
  isDone: boolean;
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