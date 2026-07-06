import './WobblyCard.css';

const DECORATIONS = {
  tape: <div className="sketch-tape" aria-hidden />,
  tack: <div className="sketch-tack" aria-hidden />,
};

/**
 * A hand-drawn card container with wobbly border, hard offset shadow,
 * and optional decorative overlays (tape strip or thumbtack).
 *
 * Usage:
 *   <WobblyCard decoration="tape" rotate={-1}>
 *     <p>Content here</p>
 *   </WobblyCard>
 *
 * Props:
 *   decoration  – "tape" | "tack" | undefined
 *   rotate      – number (degrees), e.g. 1 or -2. Default 0.
 *   className   – additional classes
 *   as          – element type (default "div")
 *   style       – additional inline styles
 */
export default function WobblyCard({
  children,
  decoration,
  rotate = 0,
  className = '',
  as: Tag = 'div',
  style,
  ...rest
}) {
  return (
    <Tag
      className={`wobbly-card ${className}`}
      style={{
        '--wobble-rotate': `${rotate}deg`,
        ...style,
      }}
      {...rest}
    >
      {decoration && DECORATIONS[decoration]}
      {children}
    </Tag>
  );
}
