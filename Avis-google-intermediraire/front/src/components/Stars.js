import { useState } from 'react';

function Stars({ onRate }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={value <= hover ? 'star filled' : 'star'}
          onClick={() => onRate(value)}
          onMouseEnter={() => setHover(value)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default Stars;
