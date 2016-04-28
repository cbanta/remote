# tv remote

This is a web server using nodejs that uses lirc and pjlink to turn on and off
tvs and projectors

Requires:
pjlink  "pip install pjlink"
exiftool "apt-get install exiftool"
nginx
node "apt-get install node; npm install n -g; n latest"
lirc "apt-get install lirc"

install to '/opt/tvremote'
run "npm install" in root directory (/opt/tvremote)
start server with pm2 - "npm install pm2 -g; pm2 start app.js"
set pm2 to run on startup - "pm2 startup; pm2 save"

configure nginx - "cp nginx.sample /etc/nginx/sites-available/default"
configure lirc
configure app - "cp config.sample.json config.json; vim config.json"
