'use strict';
const fabricClient = require('fabric-client');
var FabricCAClient = require('fabric-ca-client');
// console.log(process.cwd())
// console.log(__dirname + '/config/connection-profile.yaml')
var client = fabricClient.loadFromConfig(path.join(__dirname, './config/connection-profile.yaml'));
var fabricCAClient;
var adminUser;
client.initCredentialStores().then(() => {
  fabricCAClient = client.getCertificateAuthority();
  return client.getUserContext('admin', true);
}).then((user) => {
  if (user) {
    throw new Error("Admin already exists");
  } else {
    return fabricCAClient.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw',
      attr_reqs: [
          { name: "hf.Registrar.Roles" },
          { name: "hf.Registrar.Attributes" }
      ]
    }).then((enrollment) => {
      console.log('Successfully enrolled admin user "admin"');
      return client.createUser(
          {username: 'admin',
              mspid: 'Org1MSP',
              cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
          });
    }).then((user) => {
      adminUser = user;
      return client.setUserContext(adminUser);
    }).catch((err) => {
      console.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
      throw new Error('Failed to enroll admin');
    });
  }
}).then(() => {
    console.log('Assigned the admin user to the fabric client ::' + adminUser.toString());
}).catch((err) => {
    console.error('Failed to enroll admin: ' + err);
}); 