src/
│
├── App.tsx
│
├── components/

│   ├── Auth/
│   │   ├── LoginModal.tsx
│   │   ├── RegisterModal.tsx
│   │   └── LockScreen.tsx
│   │
│   ├── Calendar/
│   │   ├── Calendar.tsx
│   │   └── CalendarCell.tsx
│   │
│   ├── Notes/
│   │   ├── NotePanel.tsx
│   │   └── NoteCard.tsx
            NotesList.tsx
│   │
│   └── Timer/
│       └── Timer.tsx
│
├── hooks/
        useAuth.ts
│   └── useLocalStorage.ts
│
├── utils/
│   └── dateHelpers.ts
│   └── crypto.ts
│
├── types/
│   └── note.ts
│   ├── user.ts
│   └── auth.ts
│
└── styles/
    └── app.scss

Edit existing notes (click NoteCard → open NotePanel with data)
Timer sound + browser notification
Mobile responsive layout
Migrate old localStorage notes (add remaining automatically)

styles/
variables.scss
base.scss
layout.scss
calendar.scss
notes.scss
timer.scss
responsive.scss
app.scss

@use "variables";
@use "base";
@use "layout";
@use "calendar";
@use "notes";
@use "timer";
@use "responsive";

6. My priority list
If I were building version 1.0:
⭐⭐⭐⭐⭐
✅ Edit note
⭐⭐⭐⭐⭐
✅ Filter notes by selected day
⭐⭐⭐⭐⭐
✅ Import JSON
⭐⭐⭐⭐⭐
✅ Export JSON
⭐⭐⭐⭐☆
Improve calendar indicator
●
5/2
A Today button.
run time when app is closed or inactive tab
if finished - tab is togling red yellow so on