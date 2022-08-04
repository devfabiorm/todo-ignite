const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  var isValidUser = users.some(user => user.username === username);

  if(!isValidUser){
    return response.status(400).json({ error : "User not found!" });
  }

  request.username = username;
  return next();
}

function dateFormat(dateInText){

  if(!/\d{2}\/\d{2}\/\d{4}$/.test(dateInText)){
    return response
    .status(400)
    .json({ 
      title: "Não foi possível criar tarefa",
      reason: "Formato de data inválido. Formato válido: dd/MM/aaaa" 
    });
  }

  return new Date(...dateInText.split('/').reverse().map((item, index) => item - index % 2));
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
   };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  var user = users.find(user => user.username === username);
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const user = users.find(user => user.username === username);
  const dateFormatted = dateFormat(deadline);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: dateFormatted,
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users.find(user => user.username === username);
  const todo = user.todos.find(t => t.id == id);

  const formattedDate = dateFormat(deadline);

  todo.title = title;
  todo.deadline = formattedDate;

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);
  const todo = user.todos.find(t => t.id == id);

  todo.done = true;

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find(user => user.username === username);
  const todo = user.todos.find(t => t.id == id);

  user.todos.splice(todo, 1);

  return response.status(201).send();
});

module.exports = app;