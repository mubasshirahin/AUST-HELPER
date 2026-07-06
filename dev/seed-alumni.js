/**
 * Seed dummy alumni accounts for the Alumni Directory demo.
 *
 * HOW TO USE:
 *   1. Open the app in your browser (npm run dev).
 *   2. Open DevTools → Console.
 *   3. Paste this whole file's contents and press Enter.
 *   4. Refresh the page → Social Square → Alumni Directory.
 *
 * It merges these alumni into the existing accounts (won't duplicate emails).
 * All demo accounts use the password: alumni123
 */
(function seedAlumni() {
  const KEY = 'aust-auth-accounts-v1';
  const encodePassword = (p) => btoa(unescape(encodeURIComponent(p)));
  const initials = (name) =>
    name.trim().split(/\s+/).slice(0, 2).map((s) => s[0].toUpperCase()).join('');

  // batchNo: smaller = older batch (shows on top of the directory).
  const demo = [
    // CSE — spread across old to new batches
    { name: 'Tanvir Ahmed',    dept: 'CSE',  batchNo: 20, gradYear: '2016', role: 'Engineering Manager', company: 'Google' },
    { name: 'Nusrat Jahan',    dept: 'CSE',  batchNo: 20, gradYear: '2016', role: 'Senior SWE',          company: 'Meta' },
    { name: 'Rakib Hasan',     dept: 'CSE',  batchNo: 25, gradYear: '2019', role: 'Backend Engineer',    company: 'Shopify' },
    { name: 'Farhana Karim',   dept: 'CSE',  batchNo: 30, gradYear: '2022', role: 'Data Scientist',      company: 'Pathao' },
    { name: 'Sabbir Rahman',   dept: 'CSE',  batchNo: 35, gradYear: '2024', role: 'Junior Developer',    company: 'Brain Station 23' },
    // EEE
    { name: 'Imran Chowdhury', dept: 'EEE',  batchNo: 22, gradYear: '2017', role: 'Power Systems Engineer', company: 'Siemens' },
    { name: 'Sadia Islam',     dept: 'EEE',  batchNo: 28, gradYear: '2021', role: 'Hardware Engineer',   company: 'Walton' },
    // Civil
    { name: 'Mahmudul Hasan',  dept: 'CE',   batchNo: 21, gradYear: '2016', role: 'Structural Engineer', company: 'BSRM' },
    { name: 'Ayesha Siddiqua', dept: 'CE',   batchNo: 33, gradYear: '2023', role: 'Site Engineer',       company: 'Concord Group' },
  ];

  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    accounts = [];
  }

  let added = 0;
  demo.forEach((d, i) => {
    const email = `${d.name.toLowerCase().replace(/\s+/g, '.')}@aust.edu`;
    if (accounts.some((a) => a.email === email)) return; // no duplicates
    accounts.push({
      id: `ALU-DEMO${String(i + 1).padStart(2, '0')}`,
      name: d.name,
      email,
      password: encodePassword('alumni123'),
      role: 'alumni',
      department: d.dept,
      batch: `Batch ${d.batchNo}`,
      batchNo: String(d.batchNo),
      batchName: String(d.batchNo),
      designation: d.role,
      company: d.company,
      graduationYear: d.gradYear,
      initials: initials(d.name),
      createdAt: new Date().toISOString(),
    });
    added += 1;
  });

  localStorage.setItem(KEY, JSON.stringify(accounts));
  console.log(`✅ Seeded ${added} alumni (skipped ${demo.length - added} already-existing). Refresh the page.`);
})();
