import SkillRoadmap from './SkillRoadmap';

export default function CareerRoadmapsPage() {
  return (
    <div className="animate-fadeIn">
      <SkillRoadmap vaultContext={{ course: null, courseName: 'All courses' }} />
    </div>
  );
}
