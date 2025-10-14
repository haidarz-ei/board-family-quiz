export interface Team {
  name: string;
  score: number;
  strikes: { [round: number]: number };
}

export interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

export interface GameState {
  questions: { [round: number]: string };
  answers: { [round: number]: (Answer | null)[] };
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
  currentPlayingTeam: 'left' | 'right' | null;
  showQuestion: { [round: number]: boolean };
}
