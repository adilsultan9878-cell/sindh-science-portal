/* The student's class. Teachers now make their students' accounts on the teacher page (/class/), so a child
   who signs in is already in the class: there is no class code to type any more.
   app.js calls Classroom.track(row) from track(), Classroom.report(...) when a worksheet is submitted or an
   experiment is finished, and Classroom.mount(el) on the progress page. Results go out through js/student.js
   (student_report), only when the child is signed in and the teacher made the account. */
(function () {
  'use strict';

  function report(kind, chapterKey, score, total) {
    if (window.Student && window.Student.report) window.Student.report(kind, chapterKey, score, total);
  }
  // Called with every usage row app.js sends; only finished activities count for the class.
  function track(row) {
    if (row && (row.kind === 'quiz' || row.kind === 'game' || row.kind === 'competition')) report(row.kind, row.chapter_key, row.score, row.total);
  }
  function mount(el) {
    if (el && window.Student && window.Student.classCard) window.Student.classCard(el);
  }
  function current() { return null; }   // the old class-code join is gone

  try { localStorage.removeItem('ssp1.class'); localStorage.removeItem('ssp1.classOutbox'); } catch (e) { /* storage blocked */ }
  window.Classroom = { mount: mount, report: report, track: track, current: current };
})();
