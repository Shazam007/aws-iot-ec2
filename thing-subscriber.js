const awsIot = require('aws-iot-device-sdk');
const Influx = require("influx");

const device = awsIot.device({
   keyPath: '/home/ubuntu/IOT-AWS/aws-certs/private.pem.key',
  certPath: '/home/ubuntu/IOT-AWS/aws-certs/certificate.pem.crt',
    caPath: '/home/ubuntu/IOT-AWS/aws-certs/AmazonRootCA1.pem',
  clientId: 'IOT-M3',
      host: 'a1xyjl41ufshwl-ats.iot.us-east-1.amazonaws.com'
});

const DBclient = new Influx.InfluxDB({
  database: "iotDB",
  host: "localhost",
  port: 8086,
  username: "iotuser",
  password: "iotpass",
});

device
  .on('connect', function() {
    console.log('Subscriber connected to AWS IOT');
    device.subscribe('sensor/aquarium1');
  });

device
  .on('message', async (topic, payload) => {
    console.log(`Received message on topic ${topic}: ${payload.toString()}`);

    var payloadObject = JSON.parse(payload.toString());
    const { id, temperature, ambient_light } = payloadObject;
    const sensor = id;
    const tempFloat = parseFloat(temperature);
    const lightFloat = parseFloat(ambient_light);

    const record = {
      "measurement":"sensorData",
      "tags":{"host":sensor},
      "fields":{"sensor":sensor,"temp":tempFloat, "ambient_light": lightFloat}
    };

   await DBclient.writePoints([record]);
  });

device.on('error', function(error) {
  console.error('Error:', error);
});