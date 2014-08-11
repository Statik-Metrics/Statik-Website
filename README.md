Statik-Website
==============
This repository will contain the front end website source for Statik.

Running the server
------------------

In order to contribute to the site, you'll want to setup a development server. Follow the steps below in order to do so:

* Clone the repository
* Ensure that node, npm and mongodb's server are installed
  * `sudo apt-get install node npm mongodb-server`
* Ensure you can connect to your MongoDB server with the `mongo` command
  * If not, try running ``sudo mkdir -p /data/db/ && sudo chown `id -u` /data/db``
* Run `npm install` and wait for the dependencies to install
* Run `node server.js` to run the development server
* Visit [http://localhost:3000](http://localhost:3000) in your browser

You can choose an alternative port by setting the PORT environmental variable. Running something like `PORT=8080 node server.js` should work.
