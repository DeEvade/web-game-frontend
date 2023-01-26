import { Key } from 'react';

interface playerData {
  name: String;
  x: number;
  y: number;
}
const Player = (props: playerData) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: `${props.x - 100}px`,
        top: `${props.y - 25}px`,
        backgroundColor: 'green',
        width: '200px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <h2>{props.name}</h2>
    </div>
  );
};
export default Player;
