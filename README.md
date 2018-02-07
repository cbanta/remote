# tv remote

This is a web server using nodejs that uses lirc and pjlink to turn on and off
tvs and projectors

## setup pjlink

pip install pjlink

test with pjlink

## setup lirc for iguanair usb emitter

First install iguanair using this:
http://www.iguanaworks.net/wiki/doku.php?id=usbir:gettingstarted

Then use this to install lirc

```
cd /usr/src
sudo apt-get remove lirc liblircclient0
sudo apt-get build-dep lirc
sudo apt-get -b source lirc
sudo dpkg -i liblircclient*.deb lirc*.deb
echo "lirc hold" | dpkg --set-selections
echo "lirc hold" | sudo dpkg --set-selections
echo "lirc-x hold" | sudo dpkg --set-selections
echo "liblircclient0 hold" | sudo dpkg --set-selections
echo "liblircclient-dev hold" | sudo dpkg --set-selections
```
