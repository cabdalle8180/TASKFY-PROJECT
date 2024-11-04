const fs = require('fs');
const path = require('path');

const  filePath = './data/tasks.json';

exports.writeTasksToFile =  (task) => {

    fs.writeFileSync(filePath , JSON.stringify(task , null , 2));
}

exports.readTasksFromFile = () => {
    if(!fs.existsSync(filePath)){
        this.writeTasksToFile([]);
    }

    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}