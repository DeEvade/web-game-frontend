import { useState } from 'react';
import { Socket } from 'socket.io-client';

interface playerData {
  id: string;
  name: string;
  hunter: boolean;
  x: number;
  y: number;
  alive: boolean;
}

const Player = (props: {
  myPlayer: playerData;
  player: playerData;
  players: playerData[];
  socket: Socket;
}) => {
  const [hasCollided, setHasCollided] = useState<boolean>(false);

  const me = props.player;
  if (me.hunter && props.myPlayer.id == me.id && !hasCollided) {
    props.players.forEach((player) => {
      if (
        me.x < player.x + 200 &&
        me.x + 200 > player.x &&
        me.y < player.y + 50 &&
        50 + me.y > player.y &&
        me.id != player.id &&
        !player.hunter &&
        player.alive
      ) {
        props.socket.emit('deletePlayer', player);
        setHasCollided(true);
        setTimeout(() => {
          setHasCollided(false);
        }, 1000);
      }
    });
  }

  return (
    <div
      style={{
        transition: 'all 0.04s linear, background-color 1s linear',
        position: 'fixed',
        left: `${props.player.x - 100}px`,
        top: `${props.player.y - 25}px`,
        backgroundColor: props.player.hunter
          ? hasCollided
            ? 'orange'
            : 'red'
          : 'green',
        width: '200px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <h2>{props.player.name}</h2>
    </div>
  );
};
export default Player;
