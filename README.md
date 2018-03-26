# place-at-ethereum

## Deploy contracts

    cd contracts
    truffle migrate --reset

## Build Frontend

    npm install
    npm run build-client

## Start Web Server

    npm install
    DATA_FILE=<db_path> ACC_INDEX=<account index> ACC_PASS=<account password> npm start

## Import Reddit Data

Download and unzip [dataset](http://abra.me/place/diffs.bin.zip)

    FROM=<dataset_path> DATA_FILE=<dest_db> INTERVAL=<group_drawing_to_reduce_size> node import.js