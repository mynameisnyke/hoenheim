const Queue = require('bee-queue');
const transcodeQueue = new Queue('transcode');
const os = require('os')
const Arena = require('bull-arena');
const transcoder = require('./transcoder')


// Mandatory import of queue library.
const Bee = require('bee-queue');

// Number of concurrent renders
const concurrency = 1

const hostname = os.hostname()

Arena({
    // All queue libraries used must be explicitly imported and included.
    Bee,

    queues: [
        {
            // Required for each queue definition.
            name: 'transcode',

            // User-readable display name for the host. Required.
            hostId: hostname,

            type: 'bee',
        },
    ],
});

// Imports the Google Cloud client library.
const { Storage } = require('@google-cloud/storage');

// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
const storage = new Storage();



// Setup firestore here 
const admin = require("firebase-admin");
const serviceAccount = require("../keys/nykelab-ef89fec3339c.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nykelab-cloudtranscoder.firebaseio.com"
});

const db = admin.firestore();

const collectionRef = db.collection('transmutations')


transcodeQueue.process(concurrency, async (job) => {

    console.log(`Message from Transcoder Process: Processing job ${job.id}`);

    switch (job.data.outputFormat) {

        case 'webm':

            console.log(`hello from ${os.hostname} starting a new webm transcode for ${job.data.fileNameClean}`, job.data, new Date())

            let ogMetadata = await transcoder.probe(job.data.fileNameClean).catch(e => console.error(e))

            let t1 = await transcoder.convertVideoWebm(job.data.fileNameClean, job.data.outputFormat)

            // Upload hte file 
            storage.bucket(job.data.outputBucket).upload(t1.output, {
                metadata: {
                    transcoder: hostname
                }
            }).catch(e => { return e })

            let t2 = await transcoder.convertVideoWebm720(job.data.fileNameClean, job.data.outputFormat)

             // Upload hte file 
             storage.bucket(job.data.outputBucket).upload(t2.output, {
                metadata: {
                    transcoder: hostname
                }
            }).catch(e => { return e })


            let t3 = await transcoder.convertVideoWebm720(job.data.fileNameClean, job.data.outputFormat)

             // Upload hte file 
             storage.bucket(job.data.outputBucket).upload(t3.output, {
                metadata: {
                    transcoder: hostname
                }
            }).catch(e => { return e })

            // Log all of the transcode log data into firestore
            await collectionRef.doc().set({
                filename: job.data.fileNameClean,
                output: job.data.outputFormat,
                t1: t1,
                t2: t2,
                t3: t3
            }).catch(e => console.error(e))

            

        case 'mp4':

            console.log(`hello from ${os.hostname} starting a new mp4 transcode for ${job.data.fileNameClean}`, new Date())
            let ogMetadata = await transcoder.probe(job.data.fileNameClean).catch(e => console.error(e))
            let t1 = await transcoder.convertVideoH264(job.data.fileNameClean, job.data.outputFormat, ogMetadata).catch(e => console.error(e))


            // Upload t1 
            storage.bucket(job.data.outputBucket).upload(t1.output, {
                metadata: {
                    transcoder: hostname,
                    metadata: ogMetadata
                }
            }).then(uploadResults => {
                console.log(`${job.data.fileNameClean} t1 uploaded and transcode finshed`)
                collectionRef.doc(job.data.fileNameClean)
                    .set({ 'sourcejob': data, outputURI: `https://storage.cloud.google.com/${job.data.outputBucket}/${t1.output}`, inputURI: `https://storage.cloud.google.com/nrh-videos/${fileNameClean}`, filename: fileNameClean })
                    .catch(e => console.error(e))
            }).catch(e => { return e })

            let t2 = await transcoder.convertVideoH264720(job.data.fileNameClean, job.data.outputFormat, ogMetadata).catch(e => console.error(e))

            // Upload t2 
            await storage.bucket(job.data.outputBucket).upload(t2.output, {
                metadata: {
                    transcoder: hostname,
                    metadata: ogMetadata
                }
            }).catch(e => { return e })


             // Log all of the transcode log data into firestore
            await collectionRef.doc().set({
                filename: job.data.fileNameClean,
                output: job.data.outputFormat,
                t1: t1,
                t2: t2,
            }).catch(e => console.error(e))
            break
        default:
            throw new Error(`${job.data.outputFormat} ${job.data.fileNameClean}  is not a supported output format`)
    };

});

transcodeQueue.on('ready', () => {
    console.log('queue now ready to start doing things');
});

transcodeQueue.on('error', (err) => {
    console.error(`A queue error happened: ${err.message}`);
});

transcodeQueue.on('succeeded', async (job, result) => {
    console.log(`Job ${job.id} succeeded with result: ${result}`);
    const counts = await transcodeQueue.checkHealth();
    // print all the job counts
    console.log('job state counts:', counts);

});

transcodeQueue.on('failed', async (job, err) => {
    // const counts =  await transcodeQueue.checkHealth();
    // print all the job counts
    // console.log('job state counts:', counts);
    console.log(err)
    console.error(`Job ${job.data} failed with error ${err.message}`);
});

transcodeQueue.on('job progress', (jobId, progress) => {
    console.log(`Job ${jobId} reported progress: ${progress}%`);
});



exports.transcodeQueue = transcodeQueue
