const NodeHelper = require('node_helper');
const {Fritz} = require('fritzapi');

module.exports = NodeHelper.create({
	start: function() {
		var self = this;
		console.log("Starting node helper for: MMM-SmartFritz");

		this.config = null;
	},

	getData: function() {
		var self = this;
		var initialRun = true;

		var fritz = undefined;

		if (initialRun && !fritz) {
			fritz = new Fritz(this.config.user, this.config.password, this.config.address);
			fritz.getDeviceList().then(
				function(deviceList){
					console.log('Fritz Devicelist', deviceList);
					self.sendSocketNotification('MMM-SMART-FRITZ-DEVICELIST', JSON.stringify(deviceList));
				},
			).catch((error) => {
				console.error('MMM-FRITZ-ERROR',error);
			  });
			initialRun = false;
			setInterval(function() { self.getData(); }, this.config.updateInterval)
		} else {
			fritz.getDeviceList().then(function(deviceList){
				console.log('Fritz Devicelist', deviceList);
				self.sendSocketNotification('MMM-SMART-FRITZ-DEVICELIST', JSON.stringify(deviceList));
			});
		}
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'MMM-SMART-FRITZ-CONFIG') {
			console.log('Fritz Config received', payload);
			self.config = payload;
			self.getData();
		}
	}
});
