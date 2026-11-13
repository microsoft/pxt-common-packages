# Wifi ESP32

## Root certificates

In order to access the internet, a valid .pem file is required listing
the digital signatures of certificate authorities. Replace ca-bundle.pem
with a valid .pem file before building.

You can find a suitable replacement here: https://curl.se/docs/caextract.html

## Developer

Build instructions
* install ESP IDF 4.3.1
* clone https://github.com/microsoft/pxt-common-packages, link to .
* clone https://github.com/microsoft/pxt-maker, link pxt-common-packages
* create projects/... in maker, clone https://github.com/microsoft/pxt-jacdac
* open wifi--esp32
* sh run.sh
