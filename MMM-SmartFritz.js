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
        }, 30000);
        this.sendSocketNotification("CONFIG", this.config);
    },

    getData: function () {
        var f = new fritzApi.Fritz(this.config.user, this.config.password, this.config.address);

        return f.getDeviceList().then(function(deviceList){
            var thermostats = [];
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
        var header = document.createElement("header");
        header.classList.add("align-left");
        var logo = document.createElement("i");
        logo.classList.add("fa", "logo");
        header.appendChild(logo);
        var name = document.createElement("span");
        name.innerHTML = "SmartFritz";
        header.appendChild(name);
        wrapper.appendChild(header);

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

        var typeIconLabel = document.createElement("th");
        typeIconLabel.classList.add("centered");
        labelRow.appendChild(typeIconLabel);

        var lineIconLabel = document.createElement("th");
        lineIconLabel.classList.add("centered");
        labelRow.appendChild(lineIconLabel);

        var directionIconLabel = document.createElement("th");
        directionIconLabel.classList.add("centered");
        labelRow.appendChild(directionIconLabel);

        var timeIconLabel = document.createElement("th");
        timeIconLabel.classList.add("centered");
        labelRow.appendChild(timeIconLabel);

        return labelRow;
    },

    appendDataRow: function (data, appendTo) {
        var row = document.createElement("tr");

        var type = document.createElement("td");
        type.classList.add("centered");


        var line = document.createElement("td");
        line.classList.add("centered");
        line.innerHTML = data.name;
        row.appendChild(line);

        var destination_name = data.battery + '%';
        var towards = document.createElement("td");
        towards.innerHTML = destination_name;
        row.appendChild(towards);

        var time = document.createElement("td");
        time.classList.add("centered");
        var timeValue = data.temperature;
        if (timeValue === "") {
            timeValue = 0;
        }
        time.innerHTML = timeValue + " °C";
        row.appendChild(time);
        appendTo.appendChild(row);
    }
});
