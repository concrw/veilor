import { memo } from 'react';
import { C } from '@/lib/colors';
import { RADAR_DATA } from '@/data/mePageData';

const RadarChart = memo(function RadarChart({ mode, data, prev }: {
  mode: 'prev' | 'now';
  data?: { axes: string[]; vals: number[] };
  prev?: { axes: string[]; vals: number[] };
}) {
  const rd = data ?? RADAR_DATA[mode];
  const rp = prev ?? RADAR_DATA.prev;
  const cx = 75, cy = 75, r = 52;
  const n = rd.axes.length;
  const angles = rd.axes.map((_, i) => (Math.PI * 2 * i / n) - Math.PI / 2);

  const pt = (val: number, idx: number) => ({
    x: cx + r * (val / 100) * Math.cos(angles[idx]),
    y: cy + r * (val / 100) * Math.sin(angles[idx]),
  });
  const ptFull = (ratio: number, idx: number) => ({
    x: cx + r * ratio * Math.cos(angles[idx]),
    y: cy + r * ratio * Math.sin(angles[idx]),
  });

  const gridPaths = [0.25, 0.5, 0.75, 1].map(ratio => {
    const pts = angles.map((_, i) => ptFull(ratio, i));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  });

  const prevPts = rp.vals.map((v, i) => pt(v, i));
  const prevPath = prevPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  const nowPts = rd.vals.map((v, i) => pt(v, i));
  const nowPath = nowPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg width="150" height="150" viewBox="0 0 150 150">
      {gridPaths.map((d, i) => <path key={i} d={d} fill="none" stroke={C.border2} strokeWidth="1" />)}
      {angles.map((_, i) => {
        const p = ptFull(1, i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.border2} strokeWidth="1" />;
      })}
      {mode === 'now' && (
        <path d={prevPath} fill={`${C.amberGold}06`} stroke={`${C.amberGold}33`} strokeWidth="1.5" strokeDasharray="3,3" />
      )}
      <path d={nowPath} fill={`${C.amberGold}14`} stroke={C.amberGold} strokeWidth="1.8" />
      {nowPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={C.amberGold} />)}
      {angles.map((_, i) => {
        const p = ptFull(1.22, i);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill={C.text4} fontFamily="DM Sans, sans-serif">
            {rd.axes[i]}
          </text>
        );
      })}
    </svg>
  );
});

export default RadarChart;
