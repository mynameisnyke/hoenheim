const ffmpeg = require('fluent-ffmpeg');
const readableBytes = require('./readableBytes')


const probe = (file) => {

    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file, function (err, metadata) {

            if (err) {
                reject(err)
            }
            resolve(metadata)
        })
    })
}



const convertVideoWebm = (file, format, metadata) => {

    console.log(`${file} starting the job now from convertVideo func`)

    // Extract extensions
    const fileName = file.replace(/\.[^/.]+$/, "");
    return new Promise((resolve, reject) => {

        // Setting timestamp
        var begin = Date.now();
        console.log(`${file} Starting first pass`, new Date())

        // Triggering first pass
        ffmpeg(file).outputOptions(
            '-c:v', 'libvpx-vp9',
            '-pass', '1',
            '-b:v', '2000K',
            '-threads', '1',
            '-speed', '4',
            '-tile-columns', '0',
            '-frame-parallel', '0',
            '-auto-alt-ref', '1',
            '-lag-in-frames', '25',
            '-g', '9999',
            '-aq-mode', '0',
            '-an',
            '-f', 'webm',
        ).on('end', (stdout, stderr) => {

            ffmpeg(file).outputOptions(
                '-c:v', 'libvpx-vp9',
                '-pass', '2',
                '-b:v', '2000K',
                '-threads', '1',
                '-speed', '0',
                '-tile-columns', '0',
                '-frame-parallel', '0',
                '-auto-alt-ref', '1',
                '-lag-in-frames', '25',
                '-g', '9999',
                '-aq-mode', '0',
                '-c:a', 'libopus',
                '-b:a', '64k',
                '-an',
                '-f', 'webm',
            ).on('end', (stdout, stderr) => {


                // Capture finsih time from the second pass
                var end = Date.now();
                var timeSpent = (end - begin) / 1000;
                console.log(`Finished job in ${timeSpent} seconds`)


                // Probe the output for metadata
                outputMetadata = ffmpeg.ffprobe(`${fileName}.${format}`, function (err, metadata) {

                    if (err) {
                        reject(err)
                    }
                    outputMetadata = {
                        codec: metadata.streams[0].codec_name,
                        duration: metadata.format.duration,
                        hSize: readableBytes(metadata.format.size),
                        rawSize: metadata.format.size
                    }
                    resolve({ inputMetadata, outputMetadata, timeSpent, output: `${fileName}.${format}` })
                })

            }).on('error', function (err, stdout, stderr) {
                reject(err)
                console.log('Cannot process video on second pass: ' + err.message, fileName);
            }).output(`${fileName}.${format}`).run();

        }).on('error', function (err, stdout, stderr) {
            reject(err)
            console.log('Cannot process video on first pass: ' + err.message, fileName);
        }).output('/dev/null').run();

    });
}
const convertVideoWebmJO = (file, format, metadata) => {


    // Using template settings from Jan Ozer https://streaminglearningcenter.com/blogs/encoding-vp9-in-ffmpeg-an-update.html
    console.log(`${file} starting the job now from convertVideo func`)

    // Extract extensions
    const fileName = file.replace(/\.[^/.]+$/, "");
    return new Promise((resolve, reject) => {

        // Setting timestamp
        var begin = Date.now();
        console.log(`${file} Starting first pass`, new Date())

        // Triggering first pass
        ffmpeg(file).outputOptions(
            '-c:v', 'libvpx-vp9',
            '-pass', '1',
            '-b:v', '2000K',
            '-g', '48',
            '-keyint_min', '48',
            '-sc_threshold', '0',
            '-threads', '8',
            '-speed', '4',
            '-row-mt', '1',
            '-tile-columns', '4',
            '-f', 'webm',
        ).on('end', (stdout, stderr) => {

            ffmpeg(file).outputOptions(
                '-c:v', 'libvpx-vp9',
                '-pass', '2',
                '-b:v', '2000K',
                '-minrate', '2000K',
                '-maxrate', '4000K',
                '-g', '48',
                '-sc_threshold', '0',
                '-row-mt', '1',
                '-threads', '8',
                '-speed', '2',
                '-tile-columns', '4',
            ).on('end', (stdout, stderr) => {


                // Capture finsih time from the second pass
                var end = Date.now();
                var timeSpent = (end - begin) / 1000;
                console.log(`Finished job in ${timeSpent} seconds`)


                // Probe the output for metadata
                outputMetadata = ffmpeg.ffprobe(`${fileName}.${format}`, function (err, metadata) {

                    if (err) {
                        reject(err)
                    }
                    outputMetadata = {
                        codec: metadata.streams[0].codec_name,
                        duration: metadata.format.duration,
                        hSize: readableBytes(metadata.format.size),
                        rawSize: metadata.format.size
                    }
                    resolve({ inputMetadata, outputMetadata, timeSpent, output: `${fileName}.${format}` })
                })

            }).on('error', function (err, stdout, stderr) {
                reject(err)
                console.log('Cannot process video on second pass: ' + err.message, fileName);
            }).output(`${fileName}-jo2k.${format}`).run();

        }).on('error', function (err, stdout, stderr) {
            reject(err)
            console.log('Cannot process video on first pass: ' + err.message, fileName);
        }).output('/dev/null').run();

    });
}

const convertVideoWebm720 = (file, format) => {

    fmpeg.ffprobe(file, function (err, metadata) {

        if (err) {
            return err
        }

        let inputMetadata = {
            codec: metadata.streams[0].codec_name,
            duration: metadata.format.duration,
            hSize: readableBytes(metadata.format.size),
            rawSize: metadata.format.size
        }

        // Extract extensions
        const fileName = file.replace(/\.[^/.]+$/, "");
        return new Promise((resolve, reject) => {

            // Setting timestamp
            var begin = Date.now();
            console.log(`${file} Starting first pass`, new Date())

            // Triggering first pass
            ffmpeg(file).outputOptions(
                '-c:v', 'libvpx-vp9',
                '-pass', '1',
                '-b:v', '1000K',
                '-vf', `scale=-1:${metadata.streams[0].height}`,
                '-threads', '1',
                '-speed', '4',
                '-tile-columns', '0',
                '-frame-parallel', '0',
                '-auto-alt-ref', '1',
                '-lag-in-frames', '25',
                '-g', '9999',
                '-aq-mode', '0',
                '-an',
                '-f', 'webm',
            ).on('end', (stdout, stderr) => {

                // Triggering the second pass
                ffmpeg(file).outputOptions(
                    '-c:v', 'libvpx-vp9',
                    '-pass', '2',
                    '-b:v', '1000K',
                    '-vf', `scale=-1:${metadata.streams[0].height}`,
                    '-threads', '1',
                    '-speed', '0',
                    '-tile-columns', '0',
                    '-frame-parallel', '0',
                    '-auto-alt-ref', '1',
                    '-lag-in-frames', '25',
                    '-g', '9999',
                    '-aq-mode', '0',
                    '-c:a', 'libopus',
                    '-b:a', '64k',
                    '-an',
                    '-f', 'webm',
                ).on('end', (stdout, stderr) => {


                    // Capture finsih time from the second pass
                    var end = Date.now();
                    var timeSpent = (end - begin) / 1000;
                    console.log(`Finished job in ${timeSpent} seconds`)


                    // Probe the output for metadata
                    outputMetadata = ffmpeg.ffprobe(`${fileName}.${format}`, function (err, metadata) {

                        if (err) {
                            reject(err)
                        }
                        outputMetadata = {
                            codec: metadata.streams[0].codec_name,
                            duration: metadata.format.duration,
                            hSize: readableBytes(metadata.format.size),
                            rawSize: metadata.format.size
                        }
                        resolve({ inputMetadata, outputMetadata, timeSpent, output: `${fileName}x720p.${format}` })
                    })

                }).on('error', function (err, stdout, stderr) {

                    reject(err)
                    console.log('Cannot process video on second pass: ' + err.message, fileName);

                }).output(`${fileName}-720.${format}`).run();

            }).on('error', function (err, stdout, stderr) {

                reject(err)
                console.log('Cannot process video on first pass: ' + err.message, fileName);

            }).output('/dev/null').run();

        });
    })

    console.log(`${file} starting the job now from convertVideo func`)


};




const convertVideoH264 = (file, format, metadata) => {

    return new Promise((resolve, reject) => {
        // clean the filename
        const fileName = file.replace(/\.[^/.]+$/, "");
        // Define the input metadata object for firestore write
        let inputMetadata = {
            codec: metadata.streams[0].codec_name,
            duration: metadata.format.duration,
            hSize: readableBytes(metadata.format.size),
            rawSize: metadata.format.size
        }

        // Setting timestamp
        var begin = Date.now();

        console.log(`${file} Starting first pass`, new Date())

        ffmpeg(file).outputOptions(
            '-y',
            '-an',
            '-c:v', 'libx264',
            '-pass', '1',
            '-b:v', '8000k',
            '-threads', '0',
            '-speed', '4',
            '-preset', 'slower',
            '-pix_fmt', 'yuv420p',
            '-profile:v',
            'baseline',
            '-level', '3.0',
            '-movflags', '+faststart',
            '-f', 'mp4'
        ).on('end', (stdout, stderr) => {

            ffmpeg(file).outputOptions(
                '-y',
                '-an',
                '-c:v', 'libx264',
                '-pass', '2',
                '-b:v', '8000k',
                '-threads', '0',
                '-speed', '4',
                '-preset', 'slower',
                '-pix_fmt', 'yuv420p',
                '-profile:v',
                'baseline',
                '-level', '3.0',
                '-movflags', '+faststart',
                '-f', 'mp4'
            ).on('end', (stdout, stderr) => {

                // Capture finsih time from the second pass
                var end = Date.now();
                var timeSpent = (end - begin) / 1000;
                console.log(`Finished job in ${timeSpent} seconds`)


                // Probe the output for metadata
                outputMetadata = ffmpeg.ffprobe(`${fileName}.${format}`, function (err, metadata) {

                    if (err) {
                        reject(err)
                    }
                    outputMetadata = {
                        codec: metadata.streams[0].codec_name,
                        duration: metadata.format.duration,
                        hSize: readableBytes(metadata.format.size),
                        rawSize: metadata.format.size
                    }
                    resolve({ inputMetadata, outputMetadata, timeSpent, output: `${fileName}.${format}` })
                })

            }).on('error', function (err, stdout, stderr) {
                console.log('Cannot process video on second pass: ' + err.message, fileName);
                reject(err)
            }).output(`${fileName}.${format}`).run();

        }).on('error', function (err, stdout, stderr) {
            console.log('Cannot process video on first pass: ' + err.message, fileName);
            reject(err)
        }).output('/dev/null').run();
    })
}


const convertVideoH264720 = (file, format, metadata) => {

    return new Promise((resolve, reject) => {
        // clean the filename
        const fileName = file.replace(/\.[^/.]+$/, "");
        // Define the input metadata object for firestore write
        let inputMetadata = {
            codec: metadata.streams[0].codec_name,
            duration: metadata.format.duration,
            hSize: readableBytes(metadata.format.size),
            rawSize: metadata.format.size
        }

        // Setting timestamp
        var begin = Date.now();

        console.log(`${file} Starting first pass`, new Date())

        ffmpeg(file).outputOptions(
            '-y',
            '-an',
            '-c:v', 'libx264',
            '-pass', '1',
            '-vf', `scale=-1:${metadata.streams[0].height}`,
            '-b:v', '5000k',
            '-threads', '0',
            '-speed', '4',
            '-preset', 'slower',
            '-pix_fmt', 'yuv420p',
            '-profile:v',
            'baseline',
            '-level', '3.0',
            '-movflags', '+faststart',
            '-f', 'mp4'
        ).on('end', (stdout, stderr) => {

            ffmpeg(file).outputOptions(
                '-y',
                '-an',
                '-c:v', 'libx264',
                '-pass', '2',
                '-vf', `scale=-1:${metadata.streams[0].height}`,
                '-b:v', '5000k',
                '-threads', '0',
                '-speed', '4',
                '-preset', 'slower',
                '-pix_fmt', 'yuv420p',
                '-profile:v',
                'baseline',
                '-level', '3.0',
                '-movflags', '+faststart',
                '-f', 'mp4'
            ).on('end', (stdout, stderr) => {

                // Capture finsih time from the second pass
                var end = Date.now();
                var timeSpent = (end - begin) / 1000;
                console.log(`Finished job in ${timeSpent} seconds`)


                // Probe the output for metadata
                outputMetadata = ffmpeg.ffprobe(`${fileName}.${format}`, function (err, metadata) {

                    if (err) {
                        reject(err)
                    }
                    outputMetadata = {
                        codec: metadata.streams[0].codec_name,
                        duration: metadata.format.duration,
                        hSize: readableBytes(metadata.format.size),
                        rawSize: metadata.format.size
                    }
                    resolve({ inputMetadata, outputMetadata, timeSpent, output: `${fileName}x720p.${format}` })
                })

            }).on('error', function (err, stdout, stderr) {
                console.log('Cannot process video on second pass: ' + err.message, fileName);
                reject(err)
            }).output(`${fileName}x720p.${format}`).run();

        }).on('error', function (err, stdout, stderr) {
            console.log('Cannot process video on first pass: ' + err.message, fileName);
            reject(err)
        }).output('/dev/null').run();
    })
}

module.exports.convertVideoH264720 = convertVideoH264720
module.exports.convertVideoH264 = convertVideoH264
module.exports.convertVideoWebm = convertVideoWebm
module.exports.convertVideoWebmJO = convertVideoWebmJO
module.exports.convertVideoWebm720 = convertVideoWebm720
module.exports.probe = probe