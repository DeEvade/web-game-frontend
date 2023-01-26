import React, { useState, useEffect, Key } from 'react';
import io from 'socket.io-client';
import Player from './Player';
import Joi from 'joi';

const joiPlayerData = Joi.object({
  name: Joi.string().min(1).required(),
  x: Joi.number().required(),
  y: Joi.number().required(),
});

interface playerData {
  name: String;
  x: number;
  y: number;
}

const url = 'http://16.170.113.55/';

const socket = io(url);

const Game = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [players, setPlayers] = useState<playerData[]>([]);
  const [myName, setMyName] = useState<String>('');
  const [hasRegistered, setHasRegistered] = useState(false);
  const [ready, setReady] = useState(true);

  onmousemove = (e) => {
    if (ready) {
      if (hasRegistered) {
        const myPlayer = {
          name: myName,
          x: e.clientX,
          y: e.clientY,
        } as playerData;
        socket.emit('updatePlayer', myPlayer);
        setTimeout(() => {
          setReady(() => {
            return true;
          });
        }, 75);
      }
    }
  };

  const createMe = () => {
    if (!players.find((player) => player.name == myName)) {
      socket.emit('createPlayer', { name: myName, x: 0, y: 0 });
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
        console.log('daiowdnawd');

        setHasRegistered(() => {
          return true;
        });
      }
    });

    socket.on('deletePlayer', (data) => {
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
          { name: data.name, x: data.x, y: data.y },
          ...players.filter((player) => player.name != data.name),
        ];
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [myName, players]);

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
          <button onClick={createMe}>Join now!</button>
        </div>
      ) : (
        <></>
      )}
      {players.map((player) => {
        return <Player name={player.name} x={player.x} y={player.y} />;
      })}
    </div>
  );
};

export default Game;
