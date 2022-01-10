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

		var fritz = new Fritz(this.config.user, this.config.password, this.config.address);

		fritz.getDeviceList().then(function(deviceList){
			console.log('Fritz Devicelist', deviceList);
			self.sendSocketNotification('DEVICELIST', JSON.stringify(deviceList));
		});

		setTimeout(function() { self.getData(); }, this.config.updateInterval);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG') {
			console.log('Fritz COnfig received', payload);
			self.config = payload;
			self.getData();
		}
	}
});
