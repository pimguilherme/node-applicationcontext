Node ApplicationContext
=======================
Standard application context for NodeJS applications, including validation, middlewares and flow control.

Abstract
========
This library was designed so that different application setups may come to one down standard interface when writing its logic. To do so, the interface must abstract all essential tools an application needs, which are:
  - Data validation
  - Flow control
  - Error reporting


Target
======
This library is targeted to those who want their code to be manageable and uniform.


Example
=======
To illustrate the concept, here's some code to send a User 'user' a notification.

```javascript
module.exports = function () {

    this.series([

        this.validation({
            'user':function () {
                this.mongoId()
            }
        }),

        this.middleware('inflate', {'user':'User'}),

        function (next) {
            this.data.user.sendPushNotification({
                message:"This is a test!",
                payload:{
                    type:"notification_test"
                }
            }, next)
        }

    ])

}
```
