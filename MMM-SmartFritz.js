Module.register("MMM-SmartFritz", {

    defaults: {
        user: '',
        password: '',
        address: 'http://192.168.178.1'
    },

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

        setInterval(() => {
            this.intervalRun = true;
            this.updateDom();
        }, 300000);
        this.sendSocketNotification("CONFIG", this.config);
    },

    getData: function () {
        var f = new fritzApi.Fritz(this.config.user, this.config.password, this.config.address);

        return f.getDeviceList().then(function(deviceList){
            var thermostats = [];
            console.warn(deviceList)
            for (let index = 0; index < deviceList.length; index++) {
                const device = deviceList[index];
                if (device.functionbitmask === "320") {
                    console.log(device.name, device.battery, (parseFloat(device.temperature.celsius) / 10));
                    var data = {
                        name : device.name,
                        battery : device.battery,
                        temperature : (parseFloat(device.temperature.celsius) / 10)
                    };
                    thermostats.push(data);
                    if (index === (deviceList.length - 1)) {
                        return thermostats;
                    }
                }

            }
        });
    },


    getDom: function () {
        var wrapper = document.createElement("div");
        var table = document.createElement("table");
        table.classList.add("small", "table", "align-left");
        table.appendChild(this.createLabelRow());
        wrapper.appendChild(table);

        this.getData().then((data) => {
            console.warn('thermostats', data)


            for (var i = 0; i < data.length; i++) {
                this.appendDataRow(data[i], table);
            }

        });

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
        var temperatureValue = data.temperature;
        temperature.innerHTML = temperatureValue + " °C";
        row.appendChild(temperature);
        appendTo.appendChild(row);
    }
});
