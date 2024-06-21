import "@/styles/globals.css"
import type { AppProps } from "next/app"
import React, { createContext, useState, useEffect } from 'react'
import axios from "axios"
import Layout from "@/components/layout"

// Create a context for global state
export const AppContext = createContext<any>(null)

const App = ({ Component, pageProps }: AppProps) => {
  const [message, setMessage] = useState('Loading')
  const [topArtists, setTopArtists] = useState([])
  const [authenticated, setAuthenticated] = useState(false)
  const [currentSong, setCurrentSong] = useState<any>(null)
  const [guess, setGuess] = useState('')
  const [score, setScore] = useState(0)

  useEffect(() => {
    axios.get('http://localhost:8080/api/home')
      .then((response) => {
        setMessage(response.data.message)
      })
      .catch((error) => {
        console.error("Error fetching home message:", error)
      })
  }, [])

  const login = () => {
    window.location.href = 'http://localhost:8080/login'
  }

  const startGame = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/random-song')
      if (response.ok) {
        const song = await response.json()
        setCurrentSong(song)
      } else {
        console.error("Error starting game:", await response.json())
      }
    } catch (error) {
      console.error("Error starting game:", error)
    }
  }

  const handleGuess = () => {
    if (guess.toLowerCase() === currentSong.title.toLowerCase()) {
      setScore(score + 1)
      alert("Correct!")
    } else {
      alert(`Incorrect! The correct answer is ${currentSong.title}`)
    }
    setGuess('')
    startGame()
  }

  return (
    <AppContext.Provider value={{
      message,
      topArtists,
      setTopArtists,
      login,
      authenticated,
      setAuthenticated,
      currentSong,
      setCurrentSong,
      guess,
      setGuess,
      handleGuess,
      score
    }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppContext.Provider>
  )
}

export default App