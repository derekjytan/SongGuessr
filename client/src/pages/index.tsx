import React, { useContext, useEffect } from 'react'
import { AppContext } from './_app'
import Link from 'next/link'

const Index = () => {
  const { login, authenticated, setAuthenticated } = useContext(AppContext)

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/top-artists')
        if (response.status === 200) {
          setAuthenticated(true)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      }
    }

    checkAuth()
  }, [setAuthenticated])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
      <h1 className="text-6xl font-bold mb-6 font-jacquard">SongGuessr</h1>
      {authenticated ? (
        <Link href="/top-artists">
          <button className="bg-blue-500 text-white p-2 rounded">
            View Your Top 5 Artists
          </button>
        </Link>
      ) : (
        <button onClick={login} className="bg-blue-500 text-white p-2 rounded">Login with Spotify</button>
      )}
    </div>
  )
}

export default Index