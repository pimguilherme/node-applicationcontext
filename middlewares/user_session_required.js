module.exports = function (next) {
    if (this.session.user) {
        next()
    } else {
        this.halt('user_session_expected')
    }
}