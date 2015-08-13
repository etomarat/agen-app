cordova.define("com.flexblast.cordova.plugin.assetslib.AssetsLib", function(require, exports, module) { var assetslib = {

	getAllPhotos:function(successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, "AssetsLib", "getAllPhotos", []);
	},
	
	getPhotoMetadata:function(urlList, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, "AssetsLib", "getPhotoMetadata", [urlList]);
	},

	getThumbnails:function(urlList, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, "AssetsLib", "getThumbnails", [urlList]);
	}
}	

module.exports = assetslib;
});
