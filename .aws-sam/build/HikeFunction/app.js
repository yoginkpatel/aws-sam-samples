const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
var dynamoDB = new AWS.DynamoDB();

exports.hikeHandler = async (event, context) => {
    if(process.env.EnvType === 'LOCAL') {
        AWS.config.update({
            region: "us-east-1",
            endpoint: "http://docker.for.mac.localhost:8000"
        });
        dynamoDB = new AWS.DynamoDB();
    } 

    switch (event.httpMethod) {
		case 'DELETE':
			return deleteItem(event);
			break;
		case 'GET':
			return getItem(event);
			break;
		case 'POST':
			return await saveItem(event);
			break;
		case 'PUT':
			return updateItem(event);
			break;
		default:
            return sendResponse(404, `Unsupported method "${event.httpMethod}"`);
    }
};

async function saveItem(event) {
    if(event.body){
        const hike = JSON.parse(event.body);
        console.log('hike >>>' + typeof hike + 'name: ' + hike.name);
        let params = {
            TableName: process.env.HikeTable,
            Item: {
                id: { S: uuidv4() },
                name: { S: hike.name },
                title: { S: hike.title },
                locaiton: { S: hike.locaiton },
                description: { S: hike.description }
            }
        };
        console.log(`Adding hike to table ${process.env.HikeTable}`);
        await dynamoDB.putItem(params).promise();
        console.log(`Hike added to table, done`);
        return sendResponse(200, {id: params.Item.id});
    } else {
        return sendResponse(400, 'bad request: ' + event.body);
    }
}

async function getItem(event) {
    if (event.pathParameter && event.pathParameters.id){
        const hikeId = event.pathParameters.id;
        let params = {
            TableName: process.env.HikeTable,
            Key: {id: { S: hikeId }}
        };
        
        console.log(`Getting hike ${hikeId} from table ${process.env.HikeTable}`);
        let result = await dynamoDB.getItem(params).promise()
        console.log(`Done: ${JSON.stringify(result)}`);
        return sendResponse(200, {hike: result.Item});
    } else {
        let params = {
            TableName: process.env.HikeTable,
            Select: 'ALL_ATTRIBUTES'
        };
        
        console.log(`Getting all hikes from table ${process.env.HikeTable}`);
        let result = await dynamoDB.scan(params).promise()
        console.log(`Done: ${JSON.stringify(result)}`);

        return sendResponse(200, {hikes: result.Items});
    }
}

async function deleteItem(event, callback) {
	if (event.pathParameters.id){
        const hikeId = event.pathParameters.id;
        let params = {
            TableName: process.env.HikeTable,
            Key: {id: { S: hikeId }}
        };
        
        console.log(`Deleting hike ${hikeId} from table ${process.env.HikeTable}`);
        let result = await dynamoDB.deleteItem(params).promise()
        console.log(`Done: ${JSON.stringify(result)}`);
        return sendResponse(200, {});
    }
}

async function updateItem(event) {
	if(event.body){
        const hike = JSON.parse(event.body);
        let params = {
            TableName: process.env.HikeTable,
            Item: {
                id: { S: hike.id },
                name: { S: hike.name },
                title: { S: hike.title },
                locaiton: { S: hike.locaiton },
                description: { S: hike.description }
            }
        };
        console.log(`Updating hike ${hike.id} in table ${process.env.HikeTable}`);
        await dynamoDB.putItem(params).promise();
        console.log(`Hike updated in table, done`);
        return sendResponse(200, {id: params.Item.id});
    } else {
        return sendResponse(400, 'bad request: ' + event.body);
    }
}

function sendResponse(statusCode, message) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
    };
    return response;
}
