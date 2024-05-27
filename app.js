const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `SELECT
  * FROM 
  movie;`
  const moviesArray = await db.all(getMoviesQuery)
  // response.send(moviesArray)
  const convertDbobjToGivenOutput = dbObj => {
    return {
      movieName: dbObj.movie_name,
    }
  }

  response.send(
    moviesArray.map(eachMovie => convertDbobjToGivenOutput(eachMovie)),
  )
})
//post api
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES (${directorId},"${movieName}","${leadActor}");`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//get particular movie api
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieQuery = ` SELECT 
  * 
  FROM 
  movie
  WHERE movie_id = ${movieId};`
  const movie = await db.get(movieQuery)
  movieArray = []
  movieArray.push(movie)
  const convertDbobjToGivenOutput = dbObj => {
    return {
      movieId: dbObj.movie_id,
      directorId: dbObj.director_id,
      movieName: dbObj.movie_name,
      leadActor: dbObj.lead_actor,
    }
  }
  const movieFinalArray = movieArray.map(movie =>
    convertDbobjToGivenOutput(movie),
  )
  response.send(movieFinalArray[0])
})

//update api
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const movieUpdateQuery = `UPDATE movie
  SET 
  director_id = ${directorId},
  movie_name = "${movieName}",
  lead_actor = "${leadActor}"
  WHERE movie_id = ${movieId};`
  await db.run(movieUpdateQuery)
  response.send('Movie Details Updated')
})

//delete api
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE 
  FROM movie
  WHERE movie_id = ${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//get directors api
app.get('/directors/', async (request, response) => {
  const directorsQuery = `SELECT
  * FROM
  director;`
  const directorsArray = await db.all(directorsQuery)
  const convertDbobjToGivenOutput = dbObj => {
    return {
      directorId: dbObj.director_id,
      directorName: dbObj.director_name,
    }
  }
  response.send(
    directorsArray.map(eachDirector => convertDbobjToGivenOutput(eachDirector)),
  )
})

//get movie_name directed by director api
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesQuery = `SELECT 
  * FROM movie
  WHERE director_id = ${directorId};`
  const moviesArray = await db.all(getMoviesQuery)
  const convertDbobjToGivenOutput = dbObj => {
    return {
      movieName: dbObj.movie_name,
    }
  }

  response.send(
    moviesArray.map(eachMovie => convertDbobjToGivenOutput(eachMovie)),
  )
})

module.exports = app
