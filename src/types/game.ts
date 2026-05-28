export interface Team {
  name: string;
  score: number;
  strikes: { [round: number]: number };
}

export interface Answer {
  text: string;
  points: number;
  revealed: boolean;
  revealedPlayer?: 'first' | 'second' | null;
}

export interface GameState {
  questions: { [round: number]: string };
  answers: { [round: number]: (Answer | null)[] };
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
  showQuestion: { [round: number]: boolean };
  volumes?: {
    sfx: number;
    freeMusic: number;
    freeVideo: number;
  };
  _updatedAt?: number;
}
