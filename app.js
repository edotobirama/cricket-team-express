const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    `
  const players = await db.all(getPlayerQuery)

  const respObj = players.map(p => {
    return {
      playerId: p.player_id,
      playerName: p.player_name,
      jerseyNumber: p.jersey_number,
      role: p.role,
    }
  })
  response.send(respObj)
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const insertPlayerQuery = `
    INSERT INTO cricket_team(player_name,jersey_number, role)
    VALUES("${playerName}",
        ${jerseyNumber},
        "${role}");
    `
  await db.run(insertPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerID/', async (request, response) => {
  const {playerID} = request.params
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerID};
    `
  const player = await db.get(getPlayerQuery)
  const respObj = {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  }
  response.send(respObj)
})

app.put('/players/:playerID/', async (request, response) => {
  const {playerID} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
        UPDATE cricket_team
        SET player_name = "${playerName}",
            jersey_number=${jerseyNumber},
            role= "${role}"
        WHERE player_id = ${playerID};
    `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerID/', async (request, response) => {
  const {playerID} = request.params
  const deletePlayerQuery = `
        DELETE FROM
            cricket_team
        WHERE player_id= ${playerID};
    `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
