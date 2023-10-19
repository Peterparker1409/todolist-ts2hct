import express, { Request, Response } from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


// Kết nối MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'khoa',
    database: 'todo',
});

// Class đại diện cho Todo
class Todo {
    id: number;
    title: string;
    completed: boolean;

    constructor(id: number, title: string, completed: boolean) {
        this.id = id;
        this.title = title;
        this.completed = completed;
    }

    static create(todo: Todo, callback: (err: any, results: any) => void) {
        connection.query(
            'INSERT INTO new_table (title, completed) VALUES (?, ?)',
            [todo.title, todo.completed],
            callback
        );
    }

    static getAll(callback: (err: any, results: any) => void) {
        connection.query('SELECT * FROM new_table', callback);
    }

    static update(id: number, todo: Todo, callback: (err: any, results: any) => void) {
        connection.query(
            'UPDATE new_table SET title = ?, completed = ? WHERE id = ?',
            [todo.title, todo.completed, id],
            callback
        );
    }

    static delete(id: number, callback: (err: any, results: any) => void) {
        connection.query('DELETE FROM new_table WHERE id = ?', [id], callback);
    }
}

// Tạo bảng todos nếu chưa tồn tại
connection.query(
    `CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL
  )`,
    (err, results) => {
        if (err) {
            console.error('Failed to create todos table', err);
        }
    }
);

// Tạo một todo mới
app.post('/api/v1/todo', async (req: Request, res: Response) => {
    const { title, completed } = req.body;
    const newTodo = new Todo(0, title, completed);
    await Todo.create(newTodo, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Failed to create todo' });
        } else {
            newTodo.id = results.insertId;
            res.status(201).json(newTodo);
        }
    });
});

// Đọc tất cả todos
app.get('/api/v1/todo', async (req: Request, res: Response) => {
    await Todo.getAll((err, todos) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch todos' });
        } else {
            res.status(200).json(todos);
        }
    });
});

// Sửa một todo theo ID
app.put('/api/v1/todo/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;
    Todo.update(id, new Todo(id, title, completed), (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Failed to update todo' });
        } else {
            res.status(200).json({ message: 'Todo updated successfully' });
        }
    });
});

// Xóa một todo theo ID
app.delete('/api/v1/todo/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    Todo.delete(id, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Failed to delete todo' });
        } else {
            res.status(204).send();
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
