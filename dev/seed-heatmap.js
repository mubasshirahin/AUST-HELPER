// Paste in browser console to seed heatmap data
const key = 'aust-helper-dept-heatmap-submissions-v1';
const crypto = window.crypto;
const submissions = [];
const batches = ['2020', '2021', '2022'];

function rng(min, max) { return +(min + Math.random() * (max - min)).toFixed(2); }

batches.forEach(batch => {
  for (let i = 0; i < 12; i++) {
    const semesters = {};
    // each student fills 4-8 semesters
    const count = 4 + Math.floor(Math.random() * 5);
    const sems = Array.from({ length: 8 }, (_, idx) => idx + 1);
    const picked = sems.sort(() => Math.random() - 0.5).slice(0, count);
    picked.forEach(s => {
      // realistic CGPA: most between 2.5-3.8, some low, some high
      if (Math.random() < 0.15) semesters[s] = rng(2.0, 2.5);
      else if (Math.random() < 0.2) semesters[s] = rng(3.8, 4.0);
      else semesters[s] = rng(2.5, 3.8);
    });
    submissions.push({
      contributorId: crypto.randomUUID(),
      department: 'CSE',
      batchNo: batch,
      semesters,
      updatedAt: new Date().toISOString()
    });
  }
});

localStorage.setItem(key, JSON.stringify(submissions));
console.log('✅ Seeded ' + submissions.length + ' submissions (12 per batch: 2020, 2021, 2022)');
console.log('Group counts:', batches.map(b => b + ': ' + submissions.filter(x => x.batchNo === b).length).join(', '));
