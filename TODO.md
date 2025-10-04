# TODO: Fix ESLint Errors and Warnings

## Errors to Fix (14 total)
1. **src/components/DisplayView.tsx:171:67** - Unexpected any. Specify a different type ✅
2. **src/components/ui/command.tsx:24:11** - An interface declaring no members is equivalent to its supertype ✅
3. **src/components/ui/textarea.tsx:5:18** - An interface declaring no members is equivalent to its supertype ✅
4. **src/hooks/useAuth.tsx:9:65** - Unexpected any. Specify a different type ✅
5. **src/hooks/useAuth.tsx:10:65** - Unexpected any. Specify a different type ✅
6. **src/hooks/useDeviceSession.ts:9:16** - Unexpected any. Specify a different type
7. **src/hooks/useGameState.ts:86:13** - 'parsedState' is never reassigned. Use 'const' instead ✅
8. **src/hooks/useGameState.ts:195:11** - 'arr' is never reassigned. Use 'const' instead
9. **src/hooks/useGameState.ts:255:9** - 'arr' is never reassigned. Use 'const' instead
10. **src/hooks/useGameState.ts:270:9** - 'arr' is never reassigned. Use 'const' instead
11. **src/hooks/useGameState.ts:294:9** - 'arr' is never reassigned. Use 'const' instead
12. **src/pages/Auth.tsx:53:21** - Unexpected any. Specify a different type
13. **src/pages/Devices.tsx:57:38** - Unexpected any. Specify a different type
14. **tailwind.config.ts:165:13** - A `require()` style import is forbidden

## Warnings to Fix (13 total)
1. **src/components/BonusDisplayView.tsx:10:9** - useEffect dependency issue with 'currentRoundAnswers'
2. **src/components/GameBoard.tsx:36:6** - Missing dependency 'handleStrike' in useEffect
3. **src/components/ui/badge.tsx:29:17** - Fast refresh issue
4. **src/components/ui/button.tsx:47:18** - Fast refresh issue
5. **src/components/ui/form.tsx:129:10** - Fast refresh issue
6. **src/components/ui/navigation-menu.tsx:111:3** - Fast refresh issue
7. **src/components/ui/sidebar.tsx:636:3** - Fast refresh issue
8. **src/components/ui/sonner.tsx:27:19** - Fast refresh issue
9. **src/components/ui/toggle.tsx:37:18** - Fast refresh issue
10. **src/hooks/useAuth.tsx:52:6** - Missing dependency 'registerDeviceSession' in useEffect
11. **src/hooks/useAuth.tsx:119:14** - Fast refresh issue
12. **src/hooks/useDeviceSession.ts:124:6** - Missing dependency 'fetchDevices' in useEffect
13. **src/pages/Devices.tsx:35:6** - Missing dependency 'fetchDevices' in useEffect

## Steps
- [ ] Read each file with errors and understand the context
- [ ] Fix errors one by one using edit_file
- [ ] Run npm run lint after fixes to verify
- [ ] Address warnings if necessary
