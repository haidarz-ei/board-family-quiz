export interface Team {
  name: string;
  score: number;
  strikes: number;
}

export interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

export interface GameState {
  question: string;
  answers: { [round: number]: (Answer | null)[] };
  teamLeft: Team;
  teamRight: Team;
  totalScore: number;
  round: number;
  currentPlayingTeam: 'left' | 'right' | null;
}
