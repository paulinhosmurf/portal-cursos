export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'pending' | 'active';
  createdAt: number;
}

export interface Tema {
  id: string;
  name: string;
  description: string;
  color?: string;
  border?: string;
  created_at: string;
}

export interface Modulo {
  id: string;
  tema_id: string;
  name: string;
  order: number;
  created_at: string;
}

export interface Aula {
  id: string;
  modulo_id: string;
  title: string;
  content: string; // HTML format from Rich Text
  order: number;
  created_at: string;
}
