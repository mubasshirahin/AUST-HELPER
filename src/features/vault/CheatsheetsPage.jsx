import Cheatsheets from './Cheatsheets';

export default function CheatsheetsPage() {
  return (
    <div className="animate-fadeIn">
      <Cheatsheets vaultContext={{ course: null, courseName: 'All courses' }} />
    </div>
  );
}
