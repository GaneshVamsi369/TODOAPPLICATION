const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initialzeDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Running");
    });
  } catch (e) {
    console.log(`Error ${e.message}`);
    process.exit(1);
  }
};
initialzeDB();

const priorityandstatus = (request) => {
  return request.priority !== undefined && request.status !== undefined;
};

const categoryandstatus = (request) => {
  return request.category !== undefined && request.status !== undefined;
};

const categoryandpriority = (request) => {
  return request.category !== undefined && request.priority !== undefined;
};

const statuss = (request) => {
  return request.status !== undefined;
};

const priorityy = (request) => {
  return request.priority !== undefined;
};

const categoryy = (request) => {
  return request.category !== undefined;
};

const searchh = (request) => {
  return request.search_q !== undefined;
};

const output = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let query = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case priorityandstatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          query = `select * from todo 
                    where status='${status}' and priority='${priority}';`;
          data = await db.all(query);
          response.send(data.map((each) => output(each)));
        } else {
          response.status(400);
          response.end("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case categoryandstatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          query = `select * from todo 
                    where status='${status}' and category='${category}';`;
          data = await db.all(query);
          response.send(data.map((each) => output(each)));
        } else {
          response.status(400);
          response.end("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case categoryandpriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          query = `select * from todo 
                    where priority='${priority}' and category='${category}';`;
          data = await db.all(query);
          response.send(data.map((each) => output(each)));
        } else {
          response.status(400);
          response.end("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case statuss(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query = `select * from todo 
                    where status='${status}';`;
        data = await db.all(query);
        response.send(data.map((each) => output(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case priorityy(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        query = `select * from todo 
                    where priority='${priority}';`;
        data = await db.all(query);
        response.send(data.map((each) => output(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case categoryy(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        query = `select * from todo 
                    where category='${category}';`;
        data = await db.all(query);
        response.send(data.map((each) => output(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case searchh(request.query):
      query = `select * from todo
        where todo like "%${search_q}%";`;
      data = await db.all(query);
      response.send(data.map((each) => output(each)));
      break;
    default:
      query = `select * from todo;`;
      data = await db.all(query);
      response.send(data.map((each) => output(each)));
  }
});
app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let query = `select * from todo where id=${todoId};`;
  let list = await db.get(query);
  response.send(output(list));
});
app.get("/agenda/", async (request, response) => {
  let { date } = request.query;
  if (isMatch(date, "yyyy-mm-dd")) {
    let newdate = format(new Date(date), "yyyy-MM-dd");
    console.log(newdate);
    let query = `select * from todo where due_date = '${newdate}';`;
    const list = await db.all(query);
    console.log(list);
    response.send(list.map((each) => output(each)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
app.post("/todos/", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          let newdate = format(new Date(dueDate), "yyyy-MM-dd");
          let query = `insert into todo 
          (id,todo,category,priority,status,due_date) 
          values (${id},'${todo}','${category}','${priority}',
          '${status}','${newdate}');`;
          await db.run(query);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}; `;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;
  let updateTodoQuery;
  switch (true) {
    // update status
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId}; `;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId}; `;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}'
        , status='${status}', category='${category}', due_date='${dueDate}'
         WHERE id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}',
         status='${status}', category='${category}',
         due_date='${newDueDate}' WHERE id = ${todoId}; `;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        break;
      }
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let query = `delete from todo where id=${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});
module.exports = app;
