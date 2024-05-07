# @teqfw/email

The base plugin for email sending in the Tequila Framework (TeqFW).

## Disclaimer

This package is a part of the [Tequila Framework](https://flancer32.com/what-is-teqfw-f84ab4c66abf) (TeqFW). The TeqFW
is currently in an early stage of development and should be considered unstable. It may change rapidly, leading to
breaking changes without prior notice. Use it at your own risk. Please note that contributions to the project are
welcome, but they should only be made by those who understand and accept the risks of working with an unstable
framework.

## Overview

### Namespace

This plugin uses `TeqFw_Email` namespace.

## Local Configuration

```json
{
  "@teqfw/email": {
    "auth": {
      "pass": "...",
      "user": "user@gmail.com"
    },
    "from": "User Name <user@gmail.com>",
    "host": "smtp.gmail.com",
    "port": 465,
    "secure": true
  }
}
```

## Usage

```js
/** @type {TeqFw_Email_Back_Act_Send} */
let actSend;
const {success} = await actSend.act({to, subject, text, html});
```