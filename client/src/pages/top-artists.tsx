import React, { useContext, useEffect } from 'react'
import { AppContext } from './_app'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import styles from '@/styles/artists.module.css'

const TopArtistsPage = () => {
  const { topArtists, setTopArtists, authenticated, setAuthenticated } = useContext(AppContext)
  const router = useRouter()

  useEffect(() => {
    const accessToken = new URLSearchParams(window.location.search).get('access_token')
    if (accessToken) {
      setAuthenticated(true)
      fetchTopArtists(accessToken)
    }
  }, [setAuthenticated, setTopArtists])

  const fetchTopArtists = async (accessToken: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/top-artists', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      if (response.status === 200) {
        const artistData = await response.json()
        console.log('Artist Data:', artistData) // Debugging: Check the fetched data
        setTopArtists(artistData.items)
      } else {
        console.error('Failed to fetch top artists:', response.statusText)
      }
    } catch (error) {
      console.error("Error fetching top artists:", error)
    }
  }

  useEffect(() => {
    console.log('Top Artists State:', topArtists) // Debugging: Check the state update
  }, [topArtists])

  const variants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.8,
      }
    })
  }

  return (
    <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-4xl mx-auto text-center">
      <h1 className="text-6xl font-bold mb-6 font-honk">Your Top 5 Artists</h1>
      {topArtists.length > 0 ? (
        <div className="flex justify-center space-x-4">
          {topArtists.map((artist: any, index: number) => (
            <motion.div 
              key={artist.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={variants}
            >
              <img src={artist.images[0].url} alt={artist.name} className={styles.artistImage} />
              <p>{artist.name}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default TopArtistsPage