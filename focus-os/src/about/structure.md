src/
│
├── App.tsx
│
├── components/ 
        Sidebar/
            Sidebar.tsx
            Sidebar.scss
            AboutModal.tsx

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
A Today button. on click cell highlighted too
run time when app is closed or inactive tab
if finished - tab is togling red yellow so on


----------------------------------------------------------

what you say has a sence



⚙ Settings

Danger Zone
Clear all notes - enter master password - click danger red button remove

Export JSON
↓

organizer.2026-07-08.19-17.json

↓

Import JSON

then

Dropbox.

Dropbox.

User presses

Backup to Dropbox

Browser opens Dropbox login.

User approves.

then

Automatic sync. - maybe it redundant

Exactly like Notion.

Every change:

note changed

↓

JSON updated

↓

Dropbox updated

//
which cloud people actually use?
dropbox
box
pcloud
mega
google drive
one drive msft
4shared
terabox
mobidrive

ive poor knowledge of cloud so which services people uses generally the most?

as we extend it deeply i think this panel will be aside - on klick it
it slides from left with export, import dropbox drive ++ 
--
 |
--
 |
--
 |
--
 |
--

when extended: 
--------------
dropbox      |
--------------
google drive |
--------------
so on        |
--------------
so on 	     |
--------------

when mobile

 ---
 |=|  - burger like button top left fixed
 --- 

mobile extended: 
--------------
dropbox      |
--------------
google drive |
--------------
so on        |
--------------
so on 	     |
--------------




│ Calendar - just word           │
│                    │
│ Backup   - word          │
│ Import             │
│ Export             │
│                    │
│ Cloud    -word          │
│ Dropbox            │
│ Google Drive       │
│ OneDrive           │
│                    │
│ Settings  - on click danger zone :  Clear all notes - enter master password - click danger red button remove        │
│ Theme       - no       │
│ Notifications  - which? no    │
│                    │
│ About    - okay (appearing window and about with close button) 