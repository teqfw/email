# @teqfw/email

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