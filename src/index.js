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

  if (!isValidUser) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.username = username;
  return next();
}

function verifyIfTodoExists(request, response, next) {
  const { id } = request.params;
  const { username } = request;

  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({ error: "Tarefa não encontrada!" });
  }

  request.todo = todo;
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  if (users.some(user => user.username === username)) {
    return response.status(400).json({ error: true });
  }

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

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, verifyIfTodoExists, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, verifyIfTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, verifyIfTodoExists, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;