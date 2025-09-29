# TODO: Remove Hide/Show buttons from Kelola Jawaban section

- [x] Remove Hide/Show button from answer rows in regular rounds (1-4) in the "Daftar Jawaban" section of the answers tab.
- [x] Remove Hide/Show button from answer rows in bonus round (5), for both "Orang Pertama" (1-5) and "Orang Kedua" (6-10) columns in the "Daftar Jawaban" section of the answers tab.

# TODO: Remove team names and scores display for bonus round

- [x] Hide team names and scores in BonusDisplayView.tsx when round is 5 (bonus round).

# TODO: Add sound effects for answer reveals

- [ ] Add sound playback in DisplayView.tsx when answers are revealed: play "regularAnswer" for regular answers, "highestAnswer" for the answer with highest points in the round.
- [ ] Add sound playback in BonusDisplayView.tsx when answers are revealed: play "regularAnswer" for regular answers, "highestAnswer" for the answer with highest points in the round.
- [ ] Ensure sound plays only once per reveal action, not repeatedly.
