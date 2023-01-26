import { Socket } from 'socket.io-client';

interface playerData {
  name: string;
  hunter: boolean;
  x: number;
  y: number;
}

const Player = (props: {
  player: playerData;
  players: playerData[];
  socket: Socket;
}) => {
  const me = props.player;
  if (me.hunter) {
    props.players.forEach((player) => {
      if (
        me.x < player.x + 200 &&
        me.x + 200 > player.x &&
        me.y < player.y + 50 &&
        50 + me.y > player.y &&
        me.name != player.name
      ) {
        props.socket.emit('deletePlayer', player);
        console.log('COLLIDE with ' + player.name);
      }
    });
  }

  return (
    <div
      style={{
        transition: 'all linear 0.05s',
        position: 'fixed',
        left: `${props.player.x - 100}px`,
        top: `${props.player.y - 25}px`,
        backgroundColor: props.player.hunter ? 'red' : 'green',
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
