src/
│
├── App.tsx
│   services
        activityServiceLog.ts
        storageService.ts
        dropboxService.ts
        dropboxApi.ts
        googleDriveService.ts
        googleDriveApi.ts 
        pkce.ts
        activityTypeLog.ts
        activityServiceLog.ts
        activityFormat.ts 
        oneDriveService.ts
│       oneDriveApi.ts
        │   ├── cloudBackup/
        │   │   ├── dropboxBackupService.ts
        │   │   ├── googleDriveBackupService.ts
        │   │   ├── oneDriveBackupService.ts
        │   │   └── cloudBackupTypes.ts
├── components/ 
        Sidebar/
            Sidebar.tsx
            Sidebar.scss
            AboutModal.tsx
        GoogleDrive/
                GoogleDriveLoginModal.tsx
        OneDrive/
                OneDriveLoginModal.tsx


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
        Toast/
                Toast.tsx
                Toast.scss

        ActivityLog/
            ActivityLog.tsx // corresponds for activity log table
            ActivityLog.scss 
│
├── hooks/
        useAuth.ts
│   └── useLocalStorage.ts
        useCloudBackup.ts
        useOneDriveBackup.ts
│
├── utils/
│   └── dateHelpers.ts
│   └── crypto.ts
│
├── types/
│   └── note.ts
│   ├── user.ts
│   └── auth.ts
        cloud.ts
        activityLog.ts
        activityTypeLog.ts
        googleDrive.ts 
        googleDrive.d.ts
        oneDrive.ts
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
│ Settings  - on click danger zone :  Clear all notes - enter master password - click danger red button remove    
│                    │
│ About    - okay (appearing window and about with close button) ❤️ Charity for poor developers


☁ Backup uploaded
10:03
Dropbox - good. later // Later we can even display:
Dropbox ✓
Last backup
Today 10:03 - maybe over danger zone even to make some log note button - 
on click appears on the middle sticky note with all actions table: 
Backup completed
✅ Restore completed
✅ Notes imported
✅ Export finished by time (updated: in danger zone, instead of plutonium, 
we can make remove account button instead of remove notes as it qite equalls 
each other, "About" button can contain "charity for poor developers" button 
that leads to morgan chase)

✅ Local JSON Import/Export
✅ Dropbox Backup
Dropbox Restore
Toast notification system
Activity Log
Google Drive
OneDrive

The Restore flow I recommend is:

Dropbox

↓

List backups

↓

Newest first

↓

Choose backup

↓

Download

↓

Merge

↓

Existing duplicate logic

↓

Toast:

✔ Restored 12 notes

That will integrate perfectly with the duplicate-handling system you've already built. I think this is the right next milestone before adding Google Drive or OneDrive.


Activity
────────────────────────────────────────────────────────────

Provider         Backup                    Restore

Dropbox          29.07.26-14:28  🗑        29.07.26-14:31 ✓
                 29.07.26-09:56  🗑
                 28.07.26-19:19  🗑
                 ...

Google           —

OneDrive         —

Local            29.07.26-09:10 ✓         29.07.26-09:11 ✓
                 28.07.26-18:20 ✓




much words as allways/ ill show you by table: 

Backup                         Restore
05.08.26-15:48   🗑   Restore  05.08.26-15:45 ✓ // - if you restore again we just change this time/date here
                                  05.08.26-16:02 ✓ // - seems no need, redundant - user will not use or undo this data
                                  05.08.26-16:17 ✓ // - seems no need, redundant - user will not use or undo this data

so click on Activity Log table appears: 
Backup                         Restore
05.08.26-15:48   🗑   05.08.26-15:45 ✓

click on Restore table appears:
Backup                         Restore
05.08.26-15:48   🗑   (05.08.26-15:45 ✓)//button or (      restore      ) - if first restore

(05.08.26-15:45 ✓)//button - if button clicks = (     ✓     ) - button and table closes 5500

again

if click on Activity Log table appears: 
Backup                         Restore
05.08.26-15:48   🗑   05.08.26-15:45//date/time of last restore ✓

if click on Restore table appears:
Backup                         Restore
05.08.26-15:48   🗑   (05.08.26-15:45 ✓)//button with time of recent backup(last, not lust as microconductors could melt) // so now what and where to add change?
