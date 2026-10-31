# Sindh Science Learning Portal

Free Class 5 Science website in Sindhi, Urdu and English (pilot), built for The Professional Educator / EduPulse Nexus.

- **Website:** https://sindh-science-portal.vercel.app
- **Staff panel:** https://sindh-science-portal.vercel.app/admin

## What is in it

- 9 chapters, each with a lesson, a clickable diagram, a 16-question quiz, a printable worksheet (with an answer key), a game, a home experiment and key words.
- A daily question with a streak, points and badges, a timed competition with a certificate, and a leaderboard for all of Sindh, filtered by district.
- Teachers' page, glossary and search in all three languages.
- A staff panel for admins, reviewers and editors: chapters, question bank, draft → review → published, leaderboard moderation, users and statistics.

## How it is built

- Plain HTML, CSS and JavaScript with no build step. The pages are light and quick to load on slow connections.
- Content and scores are stored in Supabase (project `sindh-science-portal`, Mumbai region). Every table is protected by row-level security.
- The files in `data/` are a backup copy of the starter content. The site uses them if the database cannot be reached.
- Each student's own progress is saved only on their device. There are no logins for students, no ads and no third-party tracking.

## Staff roles

| Role | Can do |
|---|---|
| Editor | Write and edit drafts, send them to review |
| Reviewer | Everything an editor can do, plus publish, unpublish and delete questions |
| Admin | Everything, plus manage users and delete chapters |

The first account created at `/admin` becomes the admin. Every later account waits until an admin gives it a role on the **Users** page. Giving a role also confirms that person's email. This matters because Supabase's built-in mail service only sends confirmation emails to the Supabase team's own addresses.

## Adding content

Use the staff panel. Each text has a Sindhi, Urdu and English box side by side. In the lesson text:

- put one paragraph on each line,
- start a line with `- ` to make a bullet point,
- wrap key words in `**double stars**` to highlight them.

Each chapter's picture tab shows a real picture from `img/<chapter-id>.webp` above the clickable diagram. The pictures come from Wikimedia Commons under free licences (public domain, CC0, CC BY or CC BY-SA). Their credits are listed in `window.PICTURES` in `js/diagrams.js` and shown under each picture, which those licences require.

Each home experiment shows an original drawing from `img/exp/<chapter-id>.svg` (no text inside, so it suits all three languages). A new chapter gets one by adding its id to `EXP_PICTURES` in `js/app.js` and putting its drawing in that folder.

General badges (First Quiz, Science Star, …) are managed on the staff panel's **Badges** page: admins can rename them, change the emoji, change how they are earned (number of quizzes, quiz score, games, daily streak, competitions, points), switch them off or add new ones. Chapter badges are edited inside each chapter.

Every chapter's game tab also has a spelling game, made automatically from the chapter's key words (3 to 9 letters, no spaces) in the reader's language.

The 🔊 buttons play recorded Urdu and English voices for key words and chapter titles (`audio/`, listed in `audio/index.json`). There is no free Sindhi computer voice, so Sindhi words get a 🔊 only on phones that have a Sindhi voice of their own. After you add or change key words, run `python tools/make_audio.py .` again (needs `pip install edge-tts`) or the new words will use the phone's own voice.

A new class or subject is added in `data/catalog.json`: set it to `"active": true` and add chapters from the staff panel.

## Offline use (installable app)

- `sw.js` saves the app, the fonts and every chapter file on the phone during the first visit. After that, lessons, quizzes, worksheets and games open without internet.
- Scores and usage counts made while offline are kept on the phone and sent when the internet comes back.
- On Android, the home page shows an **Install as an app** button. It adds an app icon to the phone.
- When you change any CSS or JS file, raise `VERSION` in `sw.js` and the `?v=` number in `index.html` and `admin.html` to the same new value, so phones pick up the update.

## Video guides

`videos/` holds three Urdu how-to videos (students, teachers, staff panel) on one page: https://sindh-science-portal.vercel.app/videos/ — linked from the footer of every page. The staff panel video uses sample data.

## Lesson videos

Two short narrated videos in Urdu (about 2½ minutes each) open at the top of the lesson: photosynthesis (chapter 2, plants) and the water cycle (chapter 4). They are in `lesson-videos/` and listed in `window.LESSON_VIDEOS` in `js/diagrams.js`. The scripts that made them are in `tools/lesson-videos/` (`content.js` holds the Urdu narration): render the slides with `node render.js`, then build the MP4 with `python build.py` (needs `npm install playwright-core`, `pip install edge-tts imageio-ffmpeg`).

## Google search

The site is verified in Google Search Console (account adilsultan9878@gmail.com, property `https://sindh-science-portal.vercel.app/`) and the sitemap is submitted. Keep `google6bae2de0928f8594.html` in the site root, or the verification is lost.

For teachers who review on paper, `python tools/review_pack.py . review-pack.html` makes a printable pack of every chapter text in Sindhi, Urdu and English side by side (print it to PDF from any browser).

`sitemap.xml` lists every page and `robots.txt` points to it. If the site moves to your own domain, replace `https://sindh-science-portal.vercel.app` in both files, then add the site in Google Search Console and submit the sitemap there.

## Hosting elsewhere

To host on any normal web server (for example cPanel), upload the whole folder. The included `.htaccess` sends every page address to `index.html` and `/admin` to `admin.html`.
