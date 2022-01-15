Module.register("MMM-SmartFritz", {

    defaults: {
        user: '',
        password: '',
        address: 'http://192.168.178.1'
    },

	deviceData: [],

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    getStyles: function () {
        return ["MMM-SmartFritz.css"];
    },

    getScripts: function () {
        return ["fritzapi.js"]
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        Log.info("Config for Module: " + this.name, this.config);

        this.sendSocketNotification("MMM-SMART-FRITZ-CONFIG", this.config);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "MMM-SMART-FRITZ-DEVICELIST") {
			this.deviceData = JSON.parse(payload);
            this.handleData();
        }
    },

    handleData: function () {
        var thermostats = [];
        console.warn(this.deviceData)
        for (let index = 0; index < this.deviceData.length; index++) {
            const device = this.deviceData[index];
            if (device.functionbitmask === "320") {
                //console.log(device.name, device.battery, (parseFloat(device.temperature.celsius) / 10));
                var data = {
                    name : device.name,
                    battery : device.battery,
                    temperature : (parseFloat(device.temperature.celsius) / 10)
                };
                thermostats.push(data);
            }
        }
        this.getDom(thermostats);
		this.updateDom();
    },


    getDom: function () {
        console.warn('thermostats', this.deviceData)
        var wrapper = document.createElement("div");
        var table = document.createElement("table");
        table.classList.add("small", "table", "align-left");
        table.appendChild(this.createLabelRow());
        wrapper.appendChild(table);

        for (var i = 0; i < this.deviceData.length; i++) {
            this.appendDataRow(this.deviceData[i], table);
        }

        return wrapper;
    },

    createLabelRow: function () {
        var labelRow = document.createElement("tr");

        var roomiconlabel = document.createElement("th");
        var typeIcon = document.createElement("room");
        typeIcon.classList.add("fa", "fa-home");
        roomiconlabel.appendChild(typeIcon);
        labelRow.appendChild(roomiconlabel);

        var batteryLabel = document.createElement("th");
        batteryLabel.classList.add("left");
        var batteryIcon = document.createElement("batterystatus");
        batteryLabel.appendChild(batteryIcon);
        labelRow.appendChild(batteryLabel);

        var temperatureLabel = document.createElement("th");
        temperatureLabel.classList.add("right");
        var temperatureIcon = document.createElement("temperaturestatus");
        //typeIcon.classList.add("fa", "fa-lightbulb-o");
        temperatureIcon.innerHTML = "Temperature";
        temperatureLabel.appendChild(temperatureIcon);
        labelRow.appendChild(temperatureLabel);

        var lightsonlabel = document.createElement("th");
        lightsonlabel.classList.add("centered");

        return labelRow;
    },

    appendDataRow: function (data, appendTo) {
        var row = document.createElement("tr");

        var type = document.createElement("td");
        type.classList.add("centered");


        var room = document.createElement("td");
        room.classList.add("left");
        room.innerHTML = data.name;
        row.appendChild(room);

        var batteryItem = document.createElement("td");
        var batteryIcon = document.createElement('i');
        var batteryFiller = document.createElement('span');
        batteryFiller.style.width = 'calc(' + data.battery + '% - 4px)';
        if(data.battery < 5) {
            batteryIcon.classList.add('red')
        }
        batteryIcon.append(batteryFiller);
        batteryIcon.classList.add('battery');

        batteryItem.append(batteryIcon)
        row.appendChild(batteryItem);

        var temperature = document.createElement("td");
        temperature.classList.add("right");
        var temperatureValue = data.temperature.celsius;
        temperature.innerHTML = this.formatTemperature(temperatureValue) + " °C";
        row.appendChild(temperature);
        appendTo.appendChild(row);
    },

	formatTemperature: function(str) {
		return  str.substring(0, 2) + '.' + str.substring(2, str.length)
	}
});
