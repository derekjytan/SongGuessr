from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
from flask_session import Session
import requests
import base64
import os
import random
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for all routes and support credentials

# Secret key for session management
app.secret_key = os.urandom(24)

# Session configuration
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Spotify API Credentials from environment variables
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI = os.getenv('REDIRECT_URI')
SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
SPOTIFY_API_URL = 'https://api.spotify.com/v1'

# Implement Spotify Authentication
@app.route('/login')
def login():
    scope = 'user-top-read'
    auth_url = f"{SPOTIFY_AUTH_URL}?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope={scope}"
    return redirect(auth_url)

# Callback and retrieve access token
@app.route('/callback')
def callback():
    code = request.args.get('code')
    auth_header = base64.b64encode((CLIENT_ID + ':' + CLIENT_SECRET).encode()).decode()
    headers = {
        'Authorization': f'Basic {auth_header}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    payload = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    
    try:
        response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=payload)
        response.raise_for_status()
        response_data = response.json()
        
        if 'access_token' in response_data:
            session['access_token'] = response_data['access_token']
            session.modified = True
            print("Access Token:", session['access_token'])  # Debugging: Print access token
        else:
            return jsonify({'error': 'No access token found in the response.'}), 400

    except requests.RequestException as e:
        print("Error during token exchange:", e)
        return jsonify({'error': 'Error during token exchange.'}), 500
    
    return redirect(f'http://localhost:3000/top-artists?access_token={session["access_token"]}')

# Retrieve User's Top Artists
@app.route('/api/top-artists', methods=['GET'])
def get_top_artists():
    auth_header = request.headers.get('Authorization')
    print("Received Access Token:", auth_header)  # Debugging: Print the received access token
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'User not authenticated'}), 401
    
    access_token = auth_header.split(' ')[1]  # Extract the token part
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    try:
        response = requests.get(f'{SPOTIFY_API_URL}/me/top/artists?limit=5', headers=headers)
        response.raise_for_status()
        top_artists = response.json()
        print("Top Artists Data:", top_artists)  # Debugging: Print the fetched data
        
        # Store top artists in the session
        session['top_artists'] = top_artists['items']
        session.modified = True
        print("Stored Top Artists in Session:", session['top_artists'])  # Debugging: Print the stored top artists in session
        
        return jsonify(top_artists)
        
    except requests.RequestException as e:
        print("Error retrieving top artists:", e)
        return jsonify({'error': 'Error retrieving top artists.'}), 500

# Play a random song
@app.route('/api/random-song', methods=['GET'])
def get_random_song():
    auth_header = request.headers.get('Authorization')
    print("Received Access Token:", auth_header)  # Debugging: Print the received access token
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'User not authenticated'}), 401
    
    access_token = auth_header.split(' ')[1]  # Extract the token part
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    top_artists = session.get('top_artists')
    print("Top Artists from Session:", top_artists)  # Debugging: Print top artists from session
    if not top_artists:
        return jsonify({'error': 'Top artists not found in session'}), 404
    
    try:
        random_artist = random.choice(top_artists)
        tracks_artists = requests.get(f'{SPOTIFY_API_URL}/artists/{random_artist["id"]}/top-tracks?market=US', headers=headers)
        tracks_artists.raise_for_status()
        tracks = tracks_artists.json()['tracks']

        # Filter out tracks without preview URLs
        tracks_with_previews = [track for track in tracks if track.get('preview_url')]
        if not tracks_with_previews:
            return jsonify({'error': 'No tracks with previews available for this artist.'}), 404
        
        random_track = random.choice(tracks_with_previews)
        song = {
            'artist': random_artist['name'],
            'title': random_track['name'],
            'preview_url': random_track['preview_url']
        }
        print("Random Song:", song)  # Debugging: Print the selected song
        return jsonify(song)
    
    except requests.RequestException as e:
        print("Error retrieving random song:", e)
        return jsonify({'error': 'Error retrieving random song.'}), 500

# Serve the current access token to the frontend
@app.route('/api/token', methods=['GET'])
def get_token():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({'error': 'User not authenticated'}), 401
    return jsonify({'access_token': access_token})

if __name__ == '__main__':
    app.run(debug=True, port=8080)