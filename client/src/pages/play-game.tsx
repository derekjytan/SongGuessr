import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from './_app';
import { useRouter } from 'next/router';

const PlayGame = () => {
  const { currentSong, setCurrentSong, authenticated, setAuthenticated, guess, setGuess, handleGuess, score } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem('authenticated');
    console.log('Session authenticated:', auth);  // Debugging statement
    if (auth && JSON.parse(auth)) {
      setAuthenticated(true);
    }

    if (authenticated || (auth && JSON.parse(auth))) {
      startGame();
    } else {
      console.log('User not authenticated');
    }
  }, [authenticated, setAuthenticated]);

  const startGame = async () => {
    const accessToken = new URLSearchParams(window.location.search).get('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }
    console.log('Access token:', accessToken);  // Debugging statement

    try {
      const response = await fetch('http://localhost:8080/api/random-song', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const song = await response.json();
        console.log('Fetched song:', song);
        setCurrentSong(song);
        setLoading(false);
      } else {
        const errorResponse = await response.json();
        console.error('Error starting game:', errorResponse);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  return (
    <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl mx-auto text-center">
      <h1 className="text-6xl font-bold mb-6 font-honk">Guess the Song</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        currentSong && (
          <div>
            <p>Artist: {currentSong.artist}</p>
            <audio controls>
              <source src={currentSong.preview_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="mt-4">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess"
                className="p-2 border rounded"
              />
              <button onClick={handleGuess} className="bg-blue-500 text-white p-2 rounded ml-2">
                Submit Guess
              </button>
            </div>
          </div>
        )
      )}
      <div className="mt-4">
        <p>Score: {score}</p>
      </div>
    </div>
  );
};

export default PlayGame;