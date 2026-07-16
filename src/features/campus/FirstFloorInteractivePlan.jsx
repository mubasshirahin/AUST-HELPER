import BuildingStructure from './BuildingStructure';

export default function FirstFloorInteractivePlan({ onZoneSelect, selectedZone }) {
  return (
    <BuildingStructure
      selectedZone={selectedZone}
      onZoneSelect={onZoneSelect}
      title="AUST CAMPUS — First Floor"
    >
      {/* Prayer & Medical zone labels */}
      <text className="ground-small-label" x="270" y="175" textAnchor="middle" style={{ fontSize: '20px', fontWeight: 'bold' }}>Prayer </text>
      <text className="ground-small-label" x="270" y="195" textAnchor="middle" style={{ fontSize: '20px', fontWeight: 'bold' }}>Room</text>
      <text className="ground-room-label" x="365" y="228">Medical</text>
      <text className="ground-room-label" x="365" y="252">Center</text>

      {/* Plaza */}
      <text className="ground-zone-title ground-zone-title-small" x="352" y="366">Plaza</text>

      {/* Classroom labels */}
      <text className="ground-cell-label" x="674" y="175" textAnchor="middle">2A03</text>
      <text className="ground-cell-label" x="754" y="170" textAnchor="middle">2A04</text>
      <text className="ground-cell-label" x="834" y="168" textAnchor="middle">2A05</text>
      <text className="ground-cell-label" x="915" y="165" textAnchor="middle">2A06</text>
      <text className="ground-cell-label" x="995" y="163" textAnchor="middle">2A07</text>
      <text className="ground-tiny-label" x="1215" y="155" textAnchor="middle" style={{ fontSize: '15px', fontWeight: 'bold' }}>Wash</text>
      <text className="ground-tiny-label" x="1215" y="170" textAnchor="middle" style={{ fontSize: '15px', fontWeight: 'bold' }}>room</text>

      {/* Badamtola Hall */}
      <text className="ground-zone-title" x="640" y="372">Badamtola</text>

      {/* Library */}
      <text className="ground-room-label" x="1132" y="392" textAnchor="middle" style={{ fontSize: '35px', fontWeight: 'bold' }}>Library</text>

      {/* Admin zone — Proctor & Information */}
      <text className="ground-room-label" x="160" y="520" style={{ fontSize: '20px', fontWeight: 'bold' }}>Proctor</text>
      <text className="ground-room-label" x="170" y="540" style={{ fontSize: '20px', fontWeight: 'bold' }}>Room</text>
      <text className="ground-small-label" x="290" y="570" style={{ fontSize: '20px', fontWeight: 'bold' }}>Information</text>
      <text className="ground-small-label" x="320" y="588" style={{ fontSize: '20px', fontWeight: 'bold' }}>Desk</text>

      {/* Badamtola extras */}
      <text className="ground-small-label" x="570" y="530" style={{ fontSize: '15px', fontWeight: 'bold' }}>Architecture</text>
      <text className="ground-small-label" x="570" y="550" style={{ fontSize: '15px', fontWeight: 'bold' }}>Project</text>
      <text className="ground-small-label" x="570" y="570" style={{ fontSize: '15px', fontWeight: 'bold' }}>Showcase</text>
      <text className="ground-small-label" x="1030" y="700" style={{ fontSize: '20px', fontWeight: 'bold' }}>Study Room</text>
    </BuildingStructure>
  );
}
