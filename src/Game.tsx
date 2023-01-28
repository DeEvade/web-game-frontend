import { boolean } from 'joi';
import React, { useState, useEffect, Key } from 'react';
import io from 'socket.io-client';
import { isPartiallyEmittedExpression } from 'typescript';
import Player from './Player';
import { v4 } from 'uuid';

const moveSpeed = 5;

interface playerData {
  id: string;
  name: string;
  hunter: boolean;
  x: number;
  y: number;
  alive: boolean;
}
//const url = 'http://localhost:8080/';
const url = 'http://16.170.113.55/';

const socket = io(url);

const Game = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [players, setPlayers] = useState<playerData[]>([]);
  const [myPlayer, setMyPlayer] = useState<playerData>({
    id: v4(),
    name: '',
    hunter: false,
    x: 200,
    y: 250,
    alive: false,
  });
  const [isReady, setIsReady] = useState<boolean>(true);

  const [wPressed, setWPressed] = useState<boolean>(false);
  const [sPressed, setSPressed] = useState<boolean>(false);
  const [aPressed, setAPressed] = useState<boolean>(false);
  const [dPressed, setDPressed] = useState<boolean>(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat || !myPlayer.alive) return;

    if (e.key == 'w') {
      setWPressed(true);
    }

    if (e.key == 's') {
      setSPressed(true);
    }

    if (e.key == 'a') {
      setAPressed(true);
    }

    if (e.key == 'd') {
      setDPressed(true);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.repeat || !myPlayer.alive) return;

    if (e.key == 'w') {
      setWPressed(false);
    }

    if (e.key == 's') {
      setSPressed(false);
    }

    if (e.key == 'a') {
      setAPressed(false);
    }

    if (e.key == 'd') {
      setDPressed(false);
    }
  };

  const updateMyPosition = () => {
    if (myPlayer.alive) {
      setMyPlayer((me) => {
        if (wPressed) me.y -= moveSpeed;
        if (sPressed) me.y += moveSpeed;
        if (aPressed) me.x -= moveSpeed;
        if (dPressed) me.x += moveSpeed;

        return me;
      });
    }
  };

  const updateMe = () => {
    socket.emit('updatePlayer', myPlayer);
  };

  const createMe = () => {
    const player = players.find((player) => player.id == myPlayer.id);
    if (!player || player.id == myPlayer.id) {
      myPlayer.alive = true;
      socket.emit('createPlayer', myPlayer);
    }
  };

  if (isReady) {
    updateMyPosition();
    setIsReady(false);
    setTimeout(() => {
      setIsReady(true);
    }, 10);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('keyup', handleKeyUp, false);

    setInterval(() => {
      if (myPlayer.alive) updateMe();
    }, 50);
  }, [myPlayer]);

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

      if (data.id == myPlayer.id) {
        console.log('created me');

        setMyPlayer((me) => {
          return me;
        });
      }
    });

    socket.on('deletePlayer', (data) => {
      console.log('delete player', data.id);
      console.log(players);

      setPlayers((ps) => {
        ps = ps.filter((player) => data.id != player.id);
        return ps;
      });
      console.log(players);
    });

    socket.on('init', (data: playerData[]) => {
      setPlayers(() => {
        return data;
      });
    });

    socket.on('updatePlayer', (data: playerData) => {
      setPlayers((players: playerData[]) => {
        const index = players.findIndex((player) => player.id == data.id);
        players[index] = data;
        if (players[index].id == myPlayer.id && !players[index].alive) {
          setMyPlayer((me) => {
            me.alive = false;
            return me;
          });
        }
        // console.log('Updated', players[index]);

        return players;
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [myPlayer, players]);

  const handleHunterChange = (e: any) => {
    setMyPlayer((me) => {
      me.hunter = !me.hunter;
      return me;
    });
    console.log(e.target.value);
  };

  return (
    <div className="gameScreen">
      <h2>{isConnected ? 'Online' : 'Offline'}</h2>

      {!myPlayer.alive ? (
        <div style={{ backgroundColor: 'gray', margin: '20px 40%' }}>
          <h2>Register</h2>
          <input
            style={{ width: '90%' }}
            placeholder="Name"
            onChange={(event) =>
              setMyPlayer((me) => {
                me.name = event.target.value;

                return me;
              })
            }
          ></input>
          `
          <div>
            <p style={{ margin: '0px' }}>Want to be hunter?</p>
            <input
              type={'checkbox'}
              onChange={handleHunterChange}
              value={myPlayer.hunter ? 'true' : 'false'}
            ></input>
          </div>
          <button onClick={createMe}>Join now!</button>
        </div>
      ) : (
        <></>
      )}
      {players.map((player) => {
        if (player.alive)
          return (
            <Player
              myPlayer={myPlayer}
              player={player}
              players={players}
              socket={socket}
            />
          );
      })}
    </div>
  );
};

export default Game;
