import React, { useState, useEffect, Key } from 'react';
import io from 'socket.io-client';
import Player from './Player';

interface playerData {
  name: string;
  hunter: boolean;
  x: number;
  y: number;
}

const url = 'http://localhost:8080'; //'http://16.170.113.55/';

const socket = io(url);

const Game = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [players, setPlayers] = useState<playerData[]>([]);
  const [myName, setMyName] = useState<string>('');
  const [isHunter, setIsHunter] = useState<boolean>(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [ready, setReady] = useState(true);

  onmousemove = (e) => {
    if (ready) {
      if (hasRegistered) {
        setReady(false);
        const myPlayer = {
          name: myName,
          hunter: isHunter,
          x: e.clientX,
          y: e.clientY,
        } as playerData;
        socket.emit('updatePlayer', myPlayer);
        setTimeout(() => {
          setReady(() => {
            return true;
          });
        }, 40);
      }
    }
  };

  const createMe = () => {
    if (!players.find((player) => player.name == myName)) {
      socket.emit('createPlayer', {
        name: myName,
        hunter: isHunter,
        x: 0,
        y: 0,
      });
    }
  };

  //Socket stuff
  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to socket');

      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('createPlayer', (data: playerData) => {
      setPlayers(() => {
        return [...players, data];
      });
      if (data.name == myName) {
        console.log('created me');

        setHasRegistered(() => {
          return true;
        });
      }
    });

    socket.on('deletePlayer', (data) => {
      if (data.name == myName) {
        setHasRegistered(false);
      }
      setPlayers((players) => {
        return [...players.filter((player) => player.name != data.name)];
      });
    });

    socket.on('init', (data: playerData[]) => {
      setPlayers(() => {
        return data;
      });
    });

    socket.on('updatePlayer', (data: playerData) => {
      setPlayers(() => {
        return [
          { name: data.name, hunter: data.hunter, x: data.x, y: data.y },
          ...players.filter((player) => player.name != data.name),
        ];
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [myName, players]);

  const handleHunterChange = (e: any) => {
    setIsHunter(e.target.value);
  };

  return (
    <div className="gameScreen">
      <h2>{isConnected ? 'Online' : 'Offline'}</h2>
      {!hasRegistered ? (
        <div style={{ backgroundColor: 'gray', margin: '20px 40%' }}>
          <h2>Register</h2>
          <input
            style={{ width: '90%' }}
            placeholder="Name"
            onChange={(event) => setMyName(event.target.value)}
          ></input>
          `
          <div>
            <p style={{ margin: '0px' }}>Want to be hunter?</p>
            <input
              type={'checkbox'}
              onChange={handleHunterChange}
              value={isHunter ? 'true' : 'false'}
            ></input>
          </div>
          <button onClick={createMe}>Join now!</button>
        </div>
      ) : (
        <></>
      )}
      {players.map((player) => {
        return <Player player={player} players={players} socket={socket} />;
      })}
    </div>
  );
};

export default Game;
