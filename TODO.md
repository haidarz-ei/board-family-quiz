# TODO List for Board Family Quiz Fixes and Features

## Issue 1: Admin Control from Phone When Admin Page Closed
- Investigate why admin controls don't work from phone when admin page is closed and only display page remains.
- Note: User indicated to just understand why, so this is for analysis only. Likely due to local state management in admin page; state not synced when admin page closed.

## Issue 2: Question Table and Show/Hide Questions ✅ COMPLETED
- Fixed question table not updating when round is changed.
  - Added question input and toggle in GameControlTab for regular rounds (previously only for bonus).
  - Added question display in BonusDisplayView when showQuestion is true.
- Fixed questions not appearing in DisplayView and BonusDisplayView when clicking "Munculkan Pertanyaan" button.
  - Updated BonusDisplayView to show question at the top when showQuestion[round] is true.
  - Updated GameControlTab to handle question input for current round, not just bonus.

## Feature 3: Edit Answers and Points in Admin ✅ COMPLETED
- Added edit feature in AnswersManagementTab -> Daftar Jawaban.
  - Added "Edit" button in each answer row in the list for regular rounds.
  - Added "E" button in bonus round grid.
  - When clicked, prefills the "Tambah Jawaban Baru" form with the selected answer's data (text and points).
  - Sets targetIndex to the answer index for editing.
  - Updated the add button to show "Update" when targetIndex is set.
  - Form is focused and data is prefilled correctly.

## General Steps
- Read and analyze DisplayView.tsx, BonusDisplayView.tsx, and useGameState.ts for state management insights.
- Test changes in browser to verify fixes.
- Update code incrementally and test each change.
