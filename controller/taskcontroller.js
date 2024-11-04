const {IncomingForm} = require('formidable')
const {copyFileSync} = require('fs')
const { readTasksFromFile, writeTasksToFile } = require("./utils/fileHandler")
const path = require('path')


exports.getTasks = (req , res) => {
    const tasks = readTasksFromFile();
    res.writeHead(200 , {'content-type':'application/json'});
    res.end(JSON.stringify(tasks));
}

exports.createTask = (req ,res) =>{
    const form =  new IncomingForm();
    form.parse(req , (err, fields , files) => {
        if (err){
            res.writeHead(400, {'content-type':'application/json'});
            res.end(JSON.stringify({
                message :  'error parsing form'
            }))
            return;
        }

        const image  = files.image[0];

        let task = readTasksFromFile();

        let lastId = 0;
       
        lastId = task.length > 0 ? Math.max(...task.map(task => task.id)) + 1 : 1;
        
        const newTask = {
            id: lastId  ,

            title: fields.title,
            description: fields?.description ||  '',
            status: fields?.status || 'pending',
            image: image ? /uploads/${image.originalFilename} : null

        }
        task.push(newTask);
        writeTasksToFile(task);

        if (files.image){
            copyFileSync(image.filepath, path.join(__dirname , '../uploads' , image.originalFilename));
            res.end(JSON.stringify(newTask));
        }

    })

}


    exports.updateTask = (req, res) => {
        const taskId = parseInt(req.url.split('/').pop());
        
        const tasks = readTasksFromFile();
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            res.writeHead(404, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ message: "Task not found" }));
            return;
        }
    
        const form = new IncomingForm();
        
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error parsing form' }));
                return;
            }
    
            const updatedTask = {
                id:taskId,
                title: fields.title || tasks[taskIndex].title, 
                description: fields.description || tasks[taskIndex].description,
                status: fields.status || tasks[taskIndex].status, 
                image: files.image ? /uploads/${files.image[0].originalFilename} : tasks[taskIndex].image
            };
    
            tasks[taskIndex] = updatedTask;
            
            writeTasksToFile(tasks);
    
            if (files.image) {
                const image = files.image[0];
                copyFileSync(image.filepath, path.join(__dirname, '../uploads', image.originalFilename));
            }
    
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify(updatedTask));
        });
    }
    


exports.deleteTask = (req, res) => {
    const taskId = parseInt(req.url.split('/').pop());

    let tasks = readTasksFromFile();

    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        res.writeHead(404, {'content-type': 'application/json'});
        res.end(JSON.stringify({ message: 'Task not found' }));
        return;
    }

    tasks.splice(taskIndex, 1);

    writeTasksToFile(tasks);

    res.writeHead(200, {'content-type': 'application/json'});
    res.end(JSON.stringify({ message: 'Task deleted successfully' }));
}