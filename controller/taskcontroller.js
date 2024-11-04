const { IncomingForm } = require('formidable');
const { copyFileSync } = require('fs');
const { readTasksFromFile, writeTasksToFile } = require('./utils/fileHandler');
const path = require('path');

// Get all tasks
exports.getTasks = (req, res) => {
    const tasks = readTasksFromFile();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tasks));
};

// Create a new task
exports.createTask = (req, res) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error parsing form' }));
            return;
        }

        const image = files.image ? files.image[0] : null;
        let tasks = readTasksFromFile();
        const lastId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;

        const newTask = {
            id: lastId,
            title: fields.title,
            description: fields.description || '',
            status: fields.status || 'pending',
            image: image ? `/uploads/${image.originalFilename}` : null,
        };

        tasks.push(newTask);
        writeTasksToFile(tasks);

        if (image) {
            copyFileSync(image.filepath, path.join(__dirname, '../uploads', image.originalFilename));
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTask));
    });
};


exports.updateTask = (req, res) => {
    const taskId = parseInt(req.url.split('/').pop());
    let tasks = readTasksFromFile();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
        return;
    }

    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error parsing form' }));
            return;
        }

        const image = files.image ? files.image[0] : null;
        const updatedTask = {
            id: taskId,
            title: fields.title || tasks[taskIndex].title,
            description: fields.description || tasks[taskIndex].description,
            status: fields.status || tasks[taskIndex].status,
            image: image ? `/uploads/${image.originalFilename}` : tasks[taskIndex].image,
        };

        tasks[taskIndex] = updatedTask;
        writeTasksToFile(tasks);

        if (image) {
            copyFileSync(image.filepath, path.join(__dirname, '../uploads', image.originalFilename));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updatedTask));
    });
};

// Delete a task
exports.deleteTask = (req, res) => {
    const taskId = parseInt(req.url.split('/').pop());
    let tasks = readTasksFromFile();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
        return;
    }

    tasks.splice(taskIndex, 1);
    writeTasksToFile(tasks);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task deleted successfully' }));
};
