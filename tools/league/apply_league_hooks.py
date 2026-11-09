"""Hooks the District Science League page (/league/: league/index.html, league.js, league.css) into the site:
- ui-text.js: text for the league link
- app.js: a league link on /competition and on /leaderboard, real page loads for /league
- sw.js: leaves /league to the network (it needs live data anyway)
- vercel.json: /league is not rewritten to the app
- sitemap.xml: /league/
Database: migration "district_league" (tools/league/league_month.sql), RPC league_month(p_month).
Each change is applied once; running it again changes nothing. Stops without writing if an anchor is missing.
Usage: python apply_league_hooks.py <site folder> [--check]"""
import os, sys

site = sys.argv[1]
CHECK = '--check' in sys.argv


def read(f):
    return open(os.path.join(site, f), encoding='utf-8').read()


LINK = ("'<p class=\"league-link\"><a href=\"/league/\">' + icon('trophy') + ' ' + esc(t('leagueLink')) + '</a></p>' +")

EDITS = [
    ('js/ui-text.js', "leagueLink:",
     "  leaderboard: { sd: 'ليڊر بورڊ', ur: 'لیڈر بورڈ', en: 'Leaderboard' },",
     "  leaderboard: { sd: 'ليڊر بورڊ', ur: 'لیڈر بورڈ', en: 'Leaderboard' },\n"
     "  leagueLink: { sd: 'ضلعن جي سائنس ليگ ۽ اجرڪ ٽرافي ڏسو', ur: 'اضلاع کی سائنس لیگ اور اجرک ٹرافی دیکھیں', en: 'See the District Science League and the Ajrak Trophy' },"),
    # /competition: under the leaderboard link
    ('js/app.js', "esc(t('leagueLink')) + '</a></p>';",
     "        '<p><a href=\"/leaderboard\">' + icon('medal') + ' ' + esc(t('leaderboard')) + '</a></p>';",
     "        '<p><a href=\"/leaderboard\">' + icon('medal') + ' ' + esc(t('leaderboard')) + '</a></p>' +\n"
     "        '<p class=\"league-link\"><a href=\"/league/\">' + icon('trophy') + ' ' + esc(t('leagueLink')) + '</a></p>';"),
    # /leaderboard: under the heading
    ('js/app.js', "'</p>' +\n        '<p class=\"league-link\">",
     "'<h1>' + icon('medal') + ' ' + esc(t('leaderboard')) + '</h1><p class=\"muted\">' + esc(t(res.shared ? 'lbNoteShared' : 'lbNote')) + '</p>' +",
     "'<h1>' + icon('medal') + ' ' + esc(t('leaderboard')) + '</h1><p class=\"muted\">' + esc(t(res.shared ? 'lbNoteShared' : 'lbNote')) + '</p>' +\n"
     "        " + LINK),
    # links to the separate /league/ page are real page loads, not routes of the app
    ('js/app.js', "|play|league|",
     "|paper|play|", "|paper|play|league|"),
    ('sw.js', "\\/league(",
     "  if (/^\\/play(\\/|$)/.test(url.pathname)) return;",
     "  if (/^\\/league(\\/|$)/.test(url.pathname)) return;                               // the district league page is its own page\n"
     "  if (/^\\/play(\\/|$)/.test(url.pathname)) return;"),
    ('vercel.json', "league(?:/|$)|",
     "play(?:/|$)|", "play(?:/|$)|league(?:/|$)|"),
    ('sitemap.xml', "/league/</loc>",
     "  <url><loc>https://sindh-science-portal.vercel.app/paper/</loc>",
     "  <url><loc>https://sindh-science-portal.vercel.app/league/</loc><lastmod>2026-11-05</lastmod></url>\n"
     "  <url><loc>https://sindh-science-portal.vercel.app/paper/</loc>"),
]

texts, todo = {}, []
for f, done_mark, old, new in EDITS:
    s = texts.get(f) or read(f)
    if done_mark in s:
        print('already there: %s (%s)' % (f, done_mark)); texts[f] = s; continue
    n = s.count(old)
    if n != 1:
        sys.exit('anchor found %d times in %s: %s' % (n, f, old[:80]))
    texts[f] = s.replace(old, new); todo.append(f)
    print('will change: %s (%s)' % (f, done_mark))
if CHECK or not todo:
    sys.exit(0)
for f in sorted(set(todo)):
    open(os.path.join(site, f), 'w', encoding='utf-8', newline='').write(texts[f])
    print('written', f)
