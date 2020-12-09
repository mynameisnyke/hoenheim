const { transcodeQueue } = require('./queue.js')
const os = require('os')


// Imports the Google Cloud client library.
const { Storage } = require('@google-cloud/storage');

// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
const storage = new Storage();
// Makes an authenticated API request.

// Define bucket path here 
async function fetchFiles(bucketName) {

    let [files] = await storage.bucket(bucketName).getFiles().catch(e => console.error(e));
    return {files,bucketName}

}


// Uncomment to run 


fetchFiles('nl-testing')
    .catch(e => console.error(e))
    .then(async (res) => {


        if (res.files[0] === '.DS_Store') {
            console.log('Found a DS store Fileso going to pop it')
            res.files = res.files.slice(1)
        }

        // Setting timestamp
        var begin = Date.now();
        for (file of res.files) {

            console.log(file.name)
            // Remove any trailing slashes
            fileNameClean = file.name.substring(file.name.lastIndexOf("/")).replace('/', '')
            // Storage bucket recursive

            await storage.bucket(res.bucketName).file(file.name).download({ destination: `${fileNameClean}` }).then( uploadRes => {

                console.log(`${file.name} Downloaded so adding file to the queue`)
                // Create the job now that the file is downloaded
                let job = transcodeQueue.createJob({
                    fileNameClean,
                    outputFormat: 'mp4',
                    outputBucket: `${res.bucketName}`
                })
                job
                    .setId(file.name)
                    .save();
            }).catch(e => console.error(e))
        }

        // Capture finsih time from the second pass
        var end = Date.now();
        var timeSpent = (end - begin) / 1000;
        console.log(`Finished downloading ${res.bucketName} in ${timeSpent} seconds`)
    })






