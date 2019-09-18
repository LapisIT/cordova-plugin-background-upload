/* global FileTransferManager, TestUtils */

exports.defineAutoTests = function () {
  describe('Uploader', function () {
    // increase the timeout since android emulators run without acceleration on Travis and are very slow
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 80000

    var sampleFile = 'tree.jpg'
    var path = ''
    var serverHost = window.cordova.platformId === 'android' ? '10.0.2.2' : 'localhost'
    var serverUrl = 'http://' + serverHost + ':3000/upload'
    var scopedExpect = window.expect
    var nativeUploader = FileTransferManager.init()

    beforeEach(function (done) {
      TestUtils.copyFileToDataDirectory(sampleFile).then(function (newPath) {
        path = newPath
        done()
      })
    })

    afterEach(function (done) {
      TestUtils.deleteFile(sampleFile).then(done)
    })

    it('exposes FileTransferManager globally', function () {
      scopedExpect(FileTransferManager).toBeDefined()
    })

    it('should have init function', function () {
      scopedExpect(FileTransferManager.init).toBeDefined()
    })

    it('should have startUpload function', function () {
      scopedExpect(nativeUploader.startUpload).toBeDefined()
    })

    it('returns an error if no argument is given', function (done) {
      nativeUploader.on('event', function (result) {
        scopedExpect(result).toBeDefined()
        scopedExpect(result.error).toBe('upload settings object is missing or invalid argument')
        done()
      })
      nativeUploader.startUpload(null)
    })

    it('returns an error if upload id is missing', function (done) {
      nativeUploader.on('event', function (result) {
        scopedExpect(result).toBeDefined()
        scopedExpect(result.error).toBe('upload id is required')
        done()
      })
      nativeUploader.startUpload({ })
    })

    it('returns an error if serverUrl is missing', function (done) {
      nativeUploader.on('event', function (result) {
        scopedExpect(result).toBeDefined()
        scopedExpect(result.id).toBe('123_986')
        scopedExpect(result.error).toBe('server url is required')
        done()
      })
      nativeUploader.startUpload({ id: '123_986', filePath: path })
    })

    it('returns an error if serverUrl is invalid', function (done) {
      nativeUploader.on('event', function (result) {
        scopedExpect(result).toBeDefined()
        scopedExpect(result.id).toBe('123_456')
        scopedExpect(result.error).toBe('invalid server url')
        done()
      })
      nativeUploader.startUpload({ id: '123_456', serverUrl: '  ' })
    })

    it('returns an error if filePath is missing', function (done) {
      nativeUploader.on('event', function (result) {
        scopedExpect(result).toBeDefined()
        scopedExpect(result.id).toBe('123_426')
        scopedExpect(result.error).toBe('filePath is required')
        done()
      })
      nativeUploader.startUpload({ id: '123_426', serverUrl: serverUrl })
    })

    it('sends upload progress events', function (done) {
      nativeUploader.on('event', function (upload) {
        console.log('on uploader event', upload)
        scopedExpect(upload.state).toBe('UPLOADING')
        scopedExpect(upload).toBeDefined()
        scopedExpect(upload.id).toBe('422_498')
        scopedExpect(upload.progress).toBeGreaterThan(0)
        scopedExpect(upload.eventId).toBeNull()
        done()
      })
      nativeUploader.startUpload({ id: '422_498', serverUrl: serverUrl, filePath: path, headers: [], parameters: [], fileKey: 'file', showNotification: true })
    })

    it('sends success callback when upload is completed', function (done) {
      nativeUploader.on('event', function (upload) {
        if (upload.state === 'UPLOADED') {
          scopedExpect(upload.id).toBe('422_492')
          scopedExpect(upload.serverResponse).toBeDefined()
          scopedExpect(upload.eventId).toBeDefined()
          done()
        }
      })
      nativeUploader.startUpload({ id: '432_492', serverUrl: serverUrl, filePath: path })
    })
  })
}
