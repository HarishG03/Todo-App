const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const {format, compareAsc} = require('date-fns')
const app = express()
app.use(express.json())
let db
const dbPath = path.join(__dirname, 'todoApplication.db')
const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started!!!')
    })
  } catch (e) {
    console.log(`Error DB : ${e.message}`)
    process.exit(-1)
  }
}
initializeServer()
let dbObj = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  }
}


app.get('/todos/', async (request, response) => {
  const {
    status = '',
    priority = '',
    category = '',
    search_q = '',
    dueDate = '',
  } = request.query
  let res = []
  const query1 = `
  SELECT * FROM todo 
  WHERE todo LIKE '%${search_q}%' AND
  status LIKE '%${status}%'AND
  priority LIKE '%${priority}%' AND
  category LIKE '%${category}%';`
  const dbObject = await db.all(query1)
  dbObject.forEach(obj => {
    res.push(dbObj(obj))
  })
  response.send(res)
})

app.get('/todos/:todoId/',  async (request, response) => {
  const {todoId} = request.params
  const query2 = `
  SELECT * FROM todo 
  WHERE id = ${todoId};
  `
  const result2 = await db.get(query2)
  response.send(dbObj(result2))
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  let res = []
  const query3 = `
  SELECT * FROM todo 
  WHERE due_date  LIKE '${date}';`
  const result3 = await db.all(query3)
  result3.forEach(obj => {
    res.push(dbObj(obj))
  })
  response.send(res)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  const query4 = `
  INSERT INTO todo(id,todo,category,priority,status,due_date)
  VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`
  await db.run(query4)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {status, priority, todo, category, dueDate} = request.body
  const {todoId} = request.params
  let query5
  if (status !== undefined) {
    query5 = `
    UPDATE todo
    SET 
    status = '${status}'
    WHERE id = ${todoId};`
    await db.run(query5)
    response.send('Status Updated')
  } else if (priority !== undefined) {
    query5 = `
    UPDATE todo
    SET 
    priority = '${priority}'
    WHERE id = ${todoId};`
    await db.run(query5)
    response.send('Priority Updated')
  } else if (todo !== undefined) {
    query5 = `
    UPDATE todo
    SET 
    todo = '${todo}'
    WHERE id = ${todoId};`
    await db.run(query5)
    response.send('Todo Updated')
  } else if (category !== undefined) {
    query5 = `
    UPDATE todo
    SET 
    category = '${category}'
    WHERE id = ${todoId};`
    await db.run(query5)
    response.send('Category Updated')
  } else if (dueDate !== undefined) {
    query5 = `
    UPDATE todo
    SET 
    due_date = '${dueDate}'
    WHERE id = ${todoId};`
    await db.run(query5)
    response.send('Due Date Updated')
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query6 = `
  DELETE FROM todo
  WHERE id = ${todoId};`
  await db.run(query6)
  response.send('Todo Deleted')
})

module.exports = app
