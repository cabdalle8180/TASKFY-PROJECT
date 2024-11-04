const { getTasks, createTask, updateTask, deleteTask } = require("../controlles/taskController");

const taskRoutes = (req , res) => {

    if(req.method === 'GET'){
        getTasks(req , res);
    }
    else if( req.method === 'POST'){
        createTask(req , res);
    }
    else if(req.method === 'PATCH'){
        updateTask(req , res);
    }
    else if(req.method === 'DELETE'){
        deleteTask(req , res);
    }
    else{
        res.writeHead(404 ,"NOT FOUND " , {'Content-Type' : 'application/json'});
        res.end(JSON.stringify({
            message : "unknown methode requested"
        }))
    }
}

module.exports = taskRoutes;