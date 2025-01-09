# QR Code Generator

[![GitHub license](https://img.shields.io/github/license/Liquid-JS/qrcode-generator.svg)](https://github.com/Liquid-JS/qrcode-generator/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/@liquid-js/qrcode-generator.svg)](https://www.npmjs.com/package/@liquid-js/qrcode-generator)
[![scope](https://img.shields.io/npm/v/@liquid-js/qrcode-generator.svg)](https://www.npmjs.com/package/@liquid-js/qrcode-generator)

JavaScript library for generating QR codes.

## Installation

    npm install @liquid-js/qrcode-generator

## API Documentation

<https://liquid-js.github.io/qrcode-generator/>

## Usage

### Browser

```HTML
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>QR Code Generator</title>
</head>

<body>
    <div id="placeHolder"></div>
    <script type="module">
        import { QRCode } from 'https://unpkg.com/@liquid-js/qrcode-generator/lib/qr-code.js'

        const typeNumber = 4
        const errorCorrectionLevel = 'L'
        const qr = new QRCode(typeNumber, errorCorrectionLevel)
        qr.addData('Hi!')
        qr.make()
        document.getElementById('placeHolder').innerHTML = qr.createImgTag()
    </script>
</body>

</html>
```

### Node

```js
import { QRCode } from '@liquid-js/qrcode-generator'

const typeNumber = 4
const errorCorrectionLevel = 'L'
const qr = new QRCode(typeNumber, errorCorrectionLevel)
qr.addData('Hi!')
qr.make()

console.log(qr.createASCII())
```

* * *

This implementation is based on JIS X 0510:1999.

The word 'QR Code' is registered trademark of DENSO WAVE INCORPORATED
<br/><http://www.denso-wave.com/qrcode/faqpatent-e.html>
