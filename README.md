# hike-app

Setup dynamo-DB locally
docker network create sam-demo
docker run --network sam-demo --name dynamodb -d -p 8000:8000 amazon/dynamodb-local

Create dynamoDB table for local testing
aws dynamodb create-table --table-name yp-hikes --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --endpoint-url http://localhost:8000
(hash = partitionkey, range=sort key)

This will output table schema
{
    "TableDescription": {
        "AttributeDefinitions": [
            {
                "AttributeName": "id",
                "AttributeType": "S"
            }
        ],
        "TableName": "yp-hikes",
        "KeySchema": [
            {
                "AttributeName": "id",
                "KeyType": "HASH"
            }
        ],
        "TableStatus": "ACTIVE",
        "CreationDateTime": "2020-06-08T22:34:05.907000-04:00",
        "ProvisionedThroughput": {
            "LastIncreaseDateTime": "1969-12-31T19:00:00-05:00",
            "LastDecreaseDateTime": "1969-12-31T19:00:00-05:00",
            "NumberOfDecreasesToday": 0,
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        },
        "TableSizeBytes": 0,
        "ItemCount": 0,
        "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/yp-hikes"
    }
}

Delete Table
aws dynamodb delete-table --table-name yp-hikes --endpoint-url http://localhost:8000

List Tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

Scan
aws dynamodb scan --table-name yp-hikes --endpoint-url http://localhost:8000

Query
aws dynamodb query --table-name yp-hikes --endpoint-url http://localhost:8000 \
    --key-conditions '{
        "id":{
            "ComparisonOperator":"EQ",
            "AttributeValueList": [ {"S": "8c4313de-7074-44c6-88d6-e666cb044874"} ]
        }
    }' 